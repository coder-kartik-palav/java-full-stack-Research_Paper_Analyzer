package com.researchplatform.backend.service;

import com.researchplatform.backend.dto.AnalyticsResponse;
import com.researchplatform.backend.entity.ResearchPaper;
import com.researchplatform.backend.repository.ResearchPaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private ResearchPaperRepository paperRepository;

    public AnalyticsResponse getAnalytics() {
        List<ResearchPaper> allPapers = paperRepository.findAll();
        
        long totalPapers = allPapers.size();
        if (totalPapers == 0) {
            return new AnalyticsResponse(0, 0, 0.0, "N/A", new HashMap<>(), new HashMap<>());
        }

        double averageComplexity = allPapers.stream()
                .filter(p -> p.getComplexityScore() != null)
                .mapToInt(ResearchPaper::getComplexityScore)
                .average()
                .orElse(0.0);

        // Topic Distribution
        Map<String, Long> topicDistribution = new HashMap<>();
        for (ResearchPaper p : allPapers) {
            if (p.getTopics() != null) {
                String[] topics = p.getTopics().split(",");
                for (String t : topics) {
                    String trimmed = t.trim();
                    topicDistribution.put(trimmed, topicDistribution.getOrDefault(trimmed, 0L) + 1);
                }
            }
        }

        // Top Topic
        String topTopic = topicDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        // Upload Trends (Group by Month-Year)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Long> uploadTrends = allPapers.stream()
                .filter(p -> p.getUploadedAt() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getUploadedAt().format(formatter),
                        Collectors.counting()
                ));

        return AnalyticsResponse.builder()
                .totalPapers(totalPapers)
                .totalSummaries(totalPapers) // 1 summary per paper
                .averageComplexity(Math.round(averageComplexity * 10.0) / 10.0)
                .topTopic(topTopic)
                .topicDistribution(topicDistribution)
                .uploadTrends(uploadTrends)
                .build();
    }
}
