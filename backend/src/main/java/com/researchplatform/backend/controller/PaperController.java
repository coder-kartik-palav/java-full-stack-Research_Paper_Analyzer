package com.researchplatform.backend.controller;

import com.researchplatform.backend.entity.ResearchPaper;
import com.researchplatform.backend.service.PaperService;
import com.researchplatform.backend.dto.ChatRequest;
import com.researchplatform.backend.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/papers")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPaper(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            String username = authentication.getName();
            ResearchPaper paper = paperService.processAndSavePaper(file, username);
            return ResponseEntity.ok(paper);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ResearchPaper>> getUserPapers(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(paperService.getUserPapers(username));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chatWithPaper(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(paperService.chatWithPaper(request));
    }

    @GetMapping("/{id}/flashcards")
    public ResponseEntity<List<?>> getFlashcards(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getFlashcards(id));
    }

    @PostMapping("/compare")
    public ResponseEntity<Map<String, Object>> comparePapers(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(paperService.comparePapers(request));
    }
}
