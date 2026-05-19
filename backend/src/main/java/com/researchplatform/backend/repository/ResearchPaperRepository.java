package com.researchplatform.backend.repository;

import com.researchplatform.backend.entity.ResearchPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, Long> {
    List<ResearchPaper> findByUploadedByIdOrderByUploadedAtDesc(Long userId);
}
