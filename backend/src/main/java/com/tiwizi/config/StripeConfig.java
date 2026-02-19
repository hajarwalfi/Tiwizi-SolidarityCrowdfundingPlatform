package com.tiwizi.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "stripe")
@Data
@Slf4j
public class StripeConfig {

    private String apiKey;
    private String webhookSecret;
    private String currency;
    private String successUrl;
    private String cancelUrl;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isEmpty()) {
            Stripe.apiKey = apiKey;
            log.info("✅ Stripe initialized successfully");
        } else {
            log.error("❌ Stripe API Key is missing!");
        }
    }
}
