package com.tiwizi.donation.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tiwizi.entity.Donation;
import com.tiwizi.enums.DonationStatus;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.donation.repository.DonationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptService {

    private final DonationRepository donationRepository;

    public byte[] generateDonationReceipt(String donationId) throws IOException {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (donation.getStatus() != DonationStatus.SUCCESS) {
            throw new IllegalStateException("Cannot generate receipt for unpaid donation");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Font Definitions
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.BLACK);
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

            // Header - Logo/Name
            Paragraph header = new Paragraph("TIWIZI", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph slogan = new Paragraph("Digital Solidarity Platform in Morocco", FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
            slogan.setAlignment(Element.ALIGN_CENTER);
            slogan.setSpacingAfter(40);
            document.add(slogan);

            // Receipt Info Title
            Paragraph receiptTitle = new Paragraph("DONATION RECEIPT", subTitleFont);
            receiptTitle.setAlignment(Element.ALIGN_CENTER);
            receiptTitle.setSpacingAfter(20);
            document.add(receiptTitle);

            // Table for details
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(30);

            addTableRow(table, "Donation Reference:", donation.getId(), boldFont, normalFont);
            addTableRow(table, "Transaction ID:", donation.getPaymentTransactionId(), boldFont, normalFont);
            addTableRow(table, "Payment Date:", donation.getPaidAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), boldFont, normalFont);
            addTableRow(table, "Donor:", donation.getDonor().getFullName(), boldFont, normalFont);
            addTableRow(table, "Supported Cause:", donation.getCampaign().getTitle(), boldFont, normalFont);
            addTableRow(table, "Amount Paid:", formatCurrency(donation.getAmount()), boldFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(255, 122, 89)));

            document.add(table);

            // Thank you message
            Paragraph thanks = new Paragraph();
            thanks.add(new Chunk("Thank you for your generosity. ", boldFont));
            thanks.add(new Chunk("Every donation on Tiwizi helps change lives. This receipt certifies the full transfer of funds (excluding bank fees) to the beneficiary after verification.", normalFont));
            thanks.setSpacingAfter(50);
            document.add(thanks);

            // Footer / Legal info
            Paragraph footer = new Paragraph("Tiwizi Technologies LLC - Rabat, Morocco\nwww.tiwizi.ma", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        }
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        cellLabel.setPadding(10);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value != null ? value : "N/A", valueFont));
        cellValue.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        cellValue.setPadding(10);
        table.addCell(cellValue);
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        NumberFormat format = NumberFormat.getCurrencyInstance(new Locale("fr", "MA"));
        return format.format(amount).replace("MAD", "DH");
    }
}
