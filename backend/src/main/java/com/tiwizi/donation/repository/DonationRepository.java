package com.tiwizi.donation.repository;

import com.tiwizi.entity.Donation;
import com.tiwizi.enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, String> {
    List<Donation> findByCampaignId(String campaignId);
    List<Donation> findByDonorId(String donorId);
    List<Donation> findByStatus(DonationStatus status);

    Optional<Donation> findFirstByDonorIdAndStatusOrderByPaidAtDesc(String donorId, DonationStatus status);
}
