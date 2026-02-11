package com.tiwizi.auth.service;

import com.tiwizi.entity.User;
import com.tiwizi.enums.AuthProvider;
import com.tiwizi.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String providerId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String picture = oAuth2User.getAttribute("picture");

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

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
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
