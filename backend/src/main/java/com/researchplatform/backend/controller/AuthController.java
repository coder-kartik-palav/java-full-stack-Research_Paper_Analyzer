package com.researchplatform.backend.controller;

import com.researchplatform.backend.dto.AuthRequest;
import com.researchplatform.backend.dto.AuthResponse;
import com.researchplatform.backend.entity.Role;
import com.researchplatform.backend.entity.User;
import com.researchplatform.backend.repository.UserRepository;
import com.researchplatform.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Username already exists"));
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Invalid role"));
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(null, user.getUsername(), user.getRole().name(), "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            
            // Fetch user to verify role match if client sent role for specific button login
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (request.getRole() != null && !user.getRole().name().equalsIgnoreCase(request.getRole())) {
                     return ResponseEntity.status(403).body(new AuthResponse(null, null, null, "Invalid role for this user"));
                }
                
                String token = jwtUtil.generateToken(userDetails, user.getRole().name());
                return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name(), "Login successful"));
            }
            return ResponseEntity.status(401).body(new AuthResponse(null, null, null, "User not found"));
            
        } catch (Exception ex) {
            return ResponseEntity.status(401).body(new AuthResponse(null, null, null, "Invalid username or password"));
        }
    }
}
