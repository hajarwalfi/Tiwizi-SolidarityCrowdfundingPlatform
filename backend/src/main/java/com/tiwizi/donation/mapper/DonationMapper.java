package com.tiwizi.donation.mapper;

import com.tiwizi.donation.dto.DonationRequest;
import com.tiwizi.donation.dto.DonationResponse;
import com.tiwizi.entity.Donation;
import com.tiwizi.entity.User;
import org.springframework.stereotype.Component;

@Component
public class DonationMapper {

    public DonationResponse toResponse(Donation donation) {
        if (donation == null) {
            return null;
        }

        return DonationResponse.builder()
                .id(donation.getId())
                .campaignId(donation.getCampaign() != null ? donation.getCampaign().getId() : null)
                .campaignTitle(donation.getCampaign() != null ? donation.getCampaign().getTitle() : null)
                .donorId(donation.getDonor() != null ? donation.getDonor().getId() : null)
                .donorName(donation.getIsAnonymous() ? "Anonymous Donor" : getUserName(donation.getDonor()))
                .amount(donation.getAmount())
                .status(donation.getStatus())
                .isAnonymous(donation.getIsAnonymous())
                .createdAt(donation.getCreatedAt())
                .paidAt(donation.getPaidAt())
                .receiptUrl(donation.getReceiptUrl())
                .build();
    }

    public Donation toEntity(DonationRequest request) {
        if (request == null) {
            return null;
        }

        Donation donation = new Donation();
        donation.setAmount(request.getAmount());
        donation.setIsAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
        donation.setPaymentMethod(request.getPaymentMethod());
        
        return donation;
    }

    private String getUserName(User user) {
        if (user == null) {
            return "Unknown";
        }

        String fullName = user.getFullName();
        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }

        String firstName = user.getFirstName();
        String lastName = user.getLastName();

        if (firstName != null && !firstName.isBlank() && lastName != null && !lastName.isBlank()) {
            return firstName + " " + lastName;
        }

        return user.getEmail();
    }
}
