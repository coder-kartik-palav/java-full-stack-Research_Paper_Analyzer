package com.researchplatform.backend.service;

import com.researchplatform.backend.entity.ResearchPaper;
import com.researchplatform.backend.entity.User;
import com.researchplatform.backend.repository.ResearchPaperRepository;
import com.researchplatform.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.researchplatform.backend.dto.ChatRequest;
import com.researchplatform.backend.dto.ChatResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PaperService {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ResearchPaperRepository paperRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final String AI_SERVICE_URL = "http://localhost:8000/api/parse";

    public ResearchPaper processAndSavePaper(MultipartFile file, String username) {
        // 1. Store file locally
        String filePath = fileStorageService.storeFile(file);

        // 2. Send file to Python AI Service
        Map<String, Object> aiResponse = callAiService(filePath);

        // 3. Save to DB
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResearchPaper paper = ResearchPaper.builder()
                .originalFilename(file.getOriginalFilename())
                .savedFilePath(filePath)
                .title((String) aiResponse.get("title"))
                .authors(String.join(", ", (List<String>) aiResponse.get("authors")))
                .publicationYear((Integer) aiResponse.get("publicationYear"))
                .abstractText((String) aiResponse.get("abstract"))
                .shortSummary((String) aiResponse.get("shortSummary"))
                .detailedSummary((String) aiResponse.get("detailedSummary"))
                .topics(String.join(", ", (List<String>) aiResponse.get("topics")))
                .complexityScore((Integer) aiResponse.get("complexityScore"))
                .readingDifficulty((String) aiResponse.get("readingDifficulty"))
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(user)
                .build();

        return paperRepository.save(paper);
    }

    private Map<String, Object> callAiService(String filePath) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(filePath));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVICE_URL, requestEntity, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to process paper with AI Service");
        }
    }

    public List<ResearchPaper> getUserPapers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paperRepository.findByUploadedByIdOrderByUploadedAtDesc(user.getId());
    }

    public ChatResponse chatWithPaper(ChatRequest request) {
        ResearchPaper paper = paperRepository.findById(request.getPaperId())
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        Map<String, Object> aiRequest = Map.of(
            "message", request.getMessage(),
            "paperId", request.getPaperId(),
            "filePath", paper.getSavedFilePath()
        );
        
        String url = "http://localhost:8000/api/chat";
        ResponseEntity<ChatResponse> response = restTemplate.postForEntity(url, aiRequest, ChatResponse.class);
        return response.getBody();
    }

    public List<?> getFlashcards(Long paperId) {
        ResearchPaper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
                
        String url = "http://localhost:8000/api/flashcards/{paperId}?filePath={filePath}";
        ResponseEntity<List> response = restTemplate.getForEntity(
            url, 
            List.class, 
            Map.of("paperId", paperId, "filePath", paper.getSavedFilePath())
        );
        return response.getBody();
    }

    public Map<String, Object> comparePapers(Map<String, String> request) {
        String url = "http://localhost:8000/api/compare";
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        return response.getBody();
    }
}
