package com.researchplatform.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "research_papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalFilename;
    private String savedFilePath;

    private String title;
    private String authors; // Comma separated for simplicity
    private Integer publicationYear;
    
    @Column(columnDefinition = "TEXT")
    private String abstractText;
    
    @Column(columnDefinition = "TEXT")
    private String shortSummary;
    
    @Column(columnDefinition = "TEXT")
    private String detailedSummary;

    private String topics; // Comma separated

    private Integer complexityScore;
    private String readingDifficulty;

    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User uploadedBy;
}
