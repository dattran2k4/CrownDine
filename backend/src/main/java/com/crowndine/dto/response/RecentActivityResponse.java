package com.crowndine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityResponse {
    private String id;
    private String user;
    private String action;
    private String value;
    private String time;
    private String type; // e.g., 'sale', 'import', 'delete'
    private String reason;
}
