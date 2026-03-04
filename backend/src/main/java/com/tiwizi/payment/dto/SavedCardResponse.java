package com.tiwizi.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedCardResponse {
    private String paymentMethodId;
    private String brand;
    private String last4;
    private Long expMonth;
    private Long expYear;
}
