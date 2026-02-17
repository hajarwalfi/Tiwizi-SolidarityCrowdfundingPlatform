package com.tiwizi.auth.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for short-lived authorization codes.
 * After OAuth2 success, a code is generated and passed via URL redirect.
 * The frontend exchanges this code for JWT tokens via a POST request.
 * Codes are single-use and expire after 30 seconds.
 */
@Service
public class AuthCodeService {

    private static final long CODE_TTL_SECONDS = 30;

    private final Map<String, CodeEntry> codeStore = new ConcurrentHashMap<>();

    /**
     * Generate a short-lived authorization code for the given email.
     */
    public String generateCode(String email) {
        cleanup();
        String code = UUID.randomUUID().toString();
        codeStore.put(code, new CodeEntry(email, Instant.now().plusSeconds(CODE_TTL_SECONDS)));
        return code;
    }

    /**
     * Exchange a code for the associated email. Returns null if invalid or expired.
     * Codes are single-use and removed after exchange.
     */
    public String exchangeCode(String code) {
        CodeEntry entry = codeStore.remove(code);
        if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
            return null;
        }
        return entry.email();
    }

    private void cleanup() {
        Instant now = Instant.now();
        codeStore.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt()));
    }

    private record CodeEntry(String email, Instant expiresAt) {}
}
