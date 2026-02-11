package com.tiwizi.auth.service;

import com.tiwizi.entity.User;
import com.tiwizi.enums.AuthProvider;
import com.tiwizi.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final UserService userService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String firstName = oidcUser.getGivenName();
        String lastName = oidcUser.getFamilyName();
        String picture = oidcUser.getPicture();

        User user;
        if (isLinkAction()) {
            user = userService.linkOAuthAccount(
                    providerId, email, firstName, lastName, picture,
                    AuthProvider.GOOGLE
            );
        } else {
            user = userService.processOAuthUser(
                    providerId, email, firstName, lastName, picture,
                    AuthProvider.GOOGLE
            );
        }

        return new CustomOidcUser(user, oidcUser);
    }

    private boolean isLinkAction() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes)
                    RequestContextHolder.getRequestAttributes()).getRequest();
            HttpSession session = request.getSession(false);
            return session != null && "link".equals(session.getAttribute("oauth2_action"));
        } catch (Exception e) {
            return false;
        }
    }
}
