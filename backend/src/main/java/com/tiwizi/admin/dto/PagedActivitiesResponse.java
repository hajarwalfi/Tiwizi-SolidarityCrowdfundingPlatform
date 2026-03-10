package com.tiwizi.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedActivitiesResponse {
    private List<AdminActivityResponse> items;
    private long total;
    private int page;
    private int size;
    private int totalPages;
}
