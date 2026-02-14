package com.tiwizi.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CodeExchangeRequest {
    @NotBlank(message = "Authorization code is required")
    private String code;
}
