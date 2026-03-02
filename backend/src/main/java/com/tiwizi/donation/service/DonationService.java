package com.tiwizi.donation.service;

import com.tiwizi.donation.dto.DonationRequest;
import com.tiwizi.donation.dto.DonationResponse;

import java.util.List;

public interface DonationService {
    DonationResponse createDonation(DonationRequest request, String donorEmail);
    List<DonationResponse> getDonationsByCampaign(String campaignId);
    List<DonationResponse> getMyDonations(String donorEmail);
    DonationResponse getDonationById(String id);
}
