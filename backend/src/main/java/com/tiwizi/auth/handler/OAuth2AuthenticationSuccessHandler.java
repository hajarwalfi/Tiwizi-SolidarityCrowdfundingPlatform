package com.tiwizi.auth.handler;

import com.tiwizi.auth.service.AuthCodeService;
import com.tiwizi.auth.service.CustomOAuth2User;
import com.tiwizi.auth.service.CustomOidcUser;
import com.tiwizi.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthCodeService authCodeService;

    @Value("${app.oauth2.frontend-redirect-url:http://localhost:4200/oauth2/redirect}")
    private String frontendRedirectUrl;

    @Value("${app.oauth2.frontend-link-redirect-url:http://localhost:4200/dashboard/settings}")
    private String frontendLinkRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        Object principal = authentication.getPrincipal();
        User user;

        if (principal instanceof CustomOidcUser customOidcUser) {
            user = customOidcUser.getUser();
        } else if (principal instanceof CustomOAuth2User customOAuth2User) {
            user = customOAuth2User.getUser();
        } else {
            log.error("Unknown principal type: {}", principal.getClass().getName());
            throw new IllegalStateException("Unknown principal type: " + principal.getClass().getName());
        }

        // Check if this is a link action
        HttpSession session = request.getSession(false);
        boolean isLinking = session != null && "link".equals(session.getAttribute("oauth2_action"));

        if (isLinking) {
            // Clear the link action from session
            session.removeAttribute("oauth2_action");
            String provider = "google";
            log.info("OAuth2 account linked for user: {}. Provider: {}", user.getEmail(), provider);
            getRedirectStrategy().sendRedirect(request, response,
                    frontendLinkRedirectUrl + "?linked=" + provider);
        } else {
            String code = authCodeService.generateCode(user.getEmail());
            log.info("OAuth2 success for user: {}. Auth code generated.", user.getEmail());
            getRedirectStrategy().sendRedirect(request, response, frontendRedirectUrl + "?code=" + code);
        }
    }
}
