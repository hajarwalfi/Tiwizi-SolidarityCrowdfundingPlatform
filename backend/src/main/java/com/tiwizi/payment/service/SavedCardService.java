package com.tiwizi.payment.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.PaymentMethodCollection;
import com.stripe.model.SetupIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentRetrieveParams;
import com.stripe.param.PaymentIntentUpdateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PaymentMethodListParams;
import com.stripe.param.SetupIntentCreateParams;
import com.tiwizi.donation.repository.DonationRepository;
import com.tiwizi.entity.Donation;
import com.tiwizi.entity.User;
import com.tiwizi.enums.DonationStatus;
import com.tiwizi.payment.dto.SavedCardResponse;
import com.tiwizi.payment.dto.SetupIntentResponse;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing saved payment methods via Stripe SetupIntents.
 * Handles Stripe Customer creation, SetupIntent creation, and payment method retrieval/deletion.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SavedCardService {

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    /**
     * Get or create a Stripe Customer for the given user.
     */
    @Transactional
    public String getOrCreateStripeCustomer(User user) throws StripeException {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        log.info("🆕 Creating Stripe Customer for user: {}", user.getEmail());

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                .putMetadata("userId", user.getId())
                .build();

        Customer customer = Customer.create(params);

        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);

        log.info("✅ Stripe Customer created: {} for user: {}", customer.getId(), user.getEmail());
        return customer.getId();
    }

    /**
     * Create a SetupIntent to save a card for future payments.
     */
    public SetupIntentResponse createSetupIntent(User user) throws StripeException {
        String customerId = getOrCreateStripeCustomer(user);

        SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                .setCustomer(customerId)
                .addPaymentMethodType("card")
                .build();

        SetupIntent setupIntent = SetupIntent.create(params);

        log.info("✅ SetupIntent created for customer: {}", customerId);

        return SetupIntentResponse.builder()
                .clientSecret(setupIntent.getClientSecret())
                .customerId(customerId)
                .build();
    }

    /**
     * Retrieve the user's saved payment method (first card).
     */
    public SavedCardResponse getSavedCard(User user) throws StripeException {
        if (user.getStripeCustomerId() == null) {
            return null;
        }

        PaymentMethodListParams params = PaymentMethodListParams.builder()
                .setCustomer(user.getStripeCustomerId())
                .setType(PaymentMethodListParams.Type.CARD)
                .setLimit(1L)
                .build();

        PaymentMethodCollection paymentMethods = PaymentMethod.list(params);

        if (paymentMethods.getData().isEmpty()) {
            return null;
        }

        PaymentMethod pm = paymentMethods.getData().get(0);
        PaymentMethod.Card card = pm.getCard();

        return SavedCardResponse.builder()
                .paymentMethodId(pm.getId())
                .brand(card.getBrand())
                .last4(card.getLast4())
                .expMonth(card.getExpMonth())
                .expYear(card.getExpYear())
                .build();
    }

    /**
     * Delete/detach the user's saved payment method.
     */
    public void deleteSavedCard(User user) throws StripeException {
        if (user.getStripeCustomerId() == null) {
            return;
        }

        PaymentMethodListParams params = PaymentMethodListParams.builder()
                .setCustomer(user.getStripeCustomerId())
                .setType(PaymentMethodListParams.Type.CARD)
                .build();

        PaymentMethodCollection paymentMethods = PaymentMethod.list(params);

        for (PaymentMethod pm : paymentMethods.getData()) {
            pm.detach();
            log.info("🗑️ Detached payment method: {} for customer: {}", pm.getId(), user.getStripeCustomerId());
        }
    }

    /**
     * Get the default payment method ID for a user (first saved card).
     * Returns null if no saved card exists.
     */
    public String getDefaultPaymentMethodId(User user) throws StripeException {
        SavedCardResponse card = getSavedCard(user);
        return card != null ? card.getPaymentMethodId() : null;
    }

    /**
     * Update a PaymentIntent with setup_future_usage=off_session and attach the user's Stripe customer.
     * Must be called BEFORE confirming the payment so Stripe saves the card properly.
     */
    @Transactional
    public void enableFutureUsageForPaymentIntent(User user, String paymentIntentId) throws StripeException {
        String customerId = getOrCreateStripeCustomer(user);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        PaymentIntentUpdateParams params = PaymentIntentUpdateParams.builder()
                .setCustomer(customerId)
                .setSetupFutureUsage(PaymentIntentUpdateParams.SetupFutureUsage.OFF_SESSION)
                .build();
        paymentIntent.update(params);

        log.info("✅ PaymentIntent {} configured with setup_future_usage for customer {}", paymentIntentId, customerId);
    }

    /**
     * Attach an existing payment method to a user's Stripe customer.
     * Used to save a card after a successful one-time payment.
     */
    @Transactional
    public void attachPaymentMethodToCustomer(User user, String paymentMethodId) throws StripeException {
        String customerId = getOrCreateStripeCustomer(user);

        PaymentMethod pm = PaymentMethod.retrieve(paymentMethodId);
        PaymentMethodAttachParams params = PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build();
        pm.attach(params);

        log.info("✅ Payment method {} attached to customer {} for user {}", paymentMethodId, customerId, user.getEmail());
    }

    /**
     * Fallback: retrieve card details from the user's latest successful payment.
     * Used when the user has no saved card but has made payments.
     */
    public SavedCardResponse getCardFromLatestPayment(User user) {
        try {
            Optional<Donation> latestDonation = donationRepository
                    .findFirstByDonorIdAndStatusOrderByPaidAtDesc(user.getId(), DonationStatus.SUCCESS);

            if (latestDonation.isEmpty() || latestDonation.get().getPaymentTransactionId() == null) {
                return null;
            }

            String transactionId = latestDonation.get().getPaymentTransactionId();
            log.info("🔍 Fetching card info from latest payment: {}", transactionId);

            PaymentIntentRetrieveParams params = PaymentIntentRetrieveParams.builder()
                    .addExpand("payment_method")
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.retrieve(transactionId, params, null);

            PaymentMethod pm = paymentIntent.getPaymentMethodObject();
            if (pm == null || pm.getCard() == null) {
                return null;
            }

            PaymentMethod.Card card = pm.getCard();

            return SavedCardResponse.builder()
                    .paymentMethodId(pm.getId())
                    .brand(card.getBrand())
                    .last4(card.getLast4())
                    .expMonth(card.getExpMonth())
                    .expYear(card.getExpYear())
                    .build();

        } catch (Exception e) {
            log.warn("⚠️ Could not retrieve card from latest payment: {}", e.getMessage());
            return null;
        }
    }
}
