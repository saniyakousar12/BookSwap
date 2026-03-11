package com.bookswap.service;

import com.bookswap.dto.*;
import com.bookswap.entity.User;
import com.bookswap.enums.UserRole;
import com.bookswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse signup(SignupRequest request) {
        try {
            log.info("Processing signup for email: {}", request.getEmail());
            
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("Email already registered: {}", request.getEmail());
                throw new RuntimeException("Email already registered: " + request.getEmail());
            }

            // Convert role string to enum (handle case insensitivity)
            UserRole role;
            try {
                role = UserRole.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role: {}, using default USER role", request.getRole());
                role = UserRole.USER; // Default to USER if invalid role provided
            }

            // Create new user
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .role(role)
                    .isActive(true)
                    .build();

            log.debug("Saving user to database: {}", user.getEmail());
            
            // Save user
            user = userRepository.save(user);
            
            log.info("User saved successfully with ID: {}", user.getId());

            // Generate JWT token
            String token = jwtTokenProvider.generateToken(user);
            log.debug("JWT token generated for user: {}", user.getEmail());

            // Return response
            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .user(convertToDTO(user))
                    .message("User registered successfully")
                    .build();
                    
        } catch (DataIntegrityViolationException e) {
            log.error("Database constraint violation: {}", e.getMessage());
            throw new RuntimeException("Database error: Unable to register user");
        } catch (Exception e) {
            log.error("Error during signup: {}", e.getMessage(), e);
            throw new RuntimeException("Signup failed: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        try {
            log.info("Processing login for email: {}", request.getEmail());
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.warn("User not found with email: {}", request.getEmail());
                        return new RuntimeException("User not found with email: " + request.getEmail());
                    });

            if (!user.getIsActive()) {
                log.warn("Deactivated user attempted login: {}", request.getEmail());
                throw new RuntimeException("User account is deactivated");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Invalid password for user: {}", request.getEmail());
                throw new RuntimeException("Invalid credentials");
            }

            log.info("User logged in successfully: {}", user.getEmail());

            String token = jwtTokenProvider.generateToken(user);

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .user(convertToDTO(user))
                    .message("Login successful")
                    .build();
                    
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            throw e;
        }
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDTO(user);
    }

    public UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}