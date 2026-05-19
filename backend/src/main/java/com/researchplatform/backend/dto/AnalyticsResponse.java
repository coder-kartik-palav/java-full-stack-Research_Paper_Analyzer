package com.researchplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {
    private long totalPapers;
    private long totalSummaries;
    private double averageComplexity;
    private String topTopic;
    
    // For Charts
    private Map<String, Long> topicDistribution;
    private Map<String, Long> uploadTrends; // Month-Year -> count
}
