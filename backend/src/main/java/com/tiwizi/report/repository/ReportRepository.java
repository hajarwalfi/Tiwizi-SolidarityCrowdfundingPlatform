package com.tiwizi.report.repository;

import com.tiwizi.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    List<Report> findByReporterId(String reporterId);

    List<Report> findByCampaignId(String campaignId);

    List<Report> findByStatus(String status);

    boolean existsByReporterIdAndCampaignId(String reporterId, String campaignId);
}
