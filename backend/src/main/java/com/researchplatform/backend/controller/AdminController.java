package com.researchplatform.backend.controller;

import com.researchplatform.backend.entity.User;
import com.researchplatform.backend.repository.ResearchPaperRepository;
import com.researchplatform.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResearchPaperRepository paperRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats(Authentication authentication) {
        // Validate Admin Role
        if (!authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Access Denied: Admins Only");
        }

        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalPapers = paperRepository.count();
        
        long students = users.stream().filter(u -> u.getRole().name().equals("STUDENT")).count();
        long researchers = users.stream().filter(u -> u.getRole().name().equals("RESEARCHER")).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalPapers", totalPapers);
        stats.put("totalStudents", students);
        stats.put("totalResearchers", researchers);
        stats.put("systemHealth", "Excellent"); // Mock health
        stats.put("aiConfidenceAvg", 94.5); // Mock confidence

        return ResponseEntity.ok(stats);
    }
}
