package com.bookswap.service;

import com.bookswap.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwtSecret:9mK7pL2nM8bV5cX3zQ1wE4rT6yU9aB0nG2dF5hJ8kL1oP4sA7uD9vM3nX6wZ}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:86400000}")
    private long jwtExpirationMs;

    private Key key() {
        // For HS512, we need to ensure the key is at least 512 bits (64 bytes)
        byte[] keyBytes = jwtSecret.getBytes();
        if (keyBytes.length < 64) {
            log.warn("JWT secret key is too short for HS512. Minimum length is 64 characters. Using a secure generated key instead.");
            return Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUserEmailFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            log.error("Error extracting email from token: {}", e.getMessage());
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            Object userId = Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("userId");
            
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
            return Long.valueOf(userId.toString());
        } catch (Exception e) {
            log.error("Error extracting user ID from token: {}", e.getMessage());
            return null;
        }
    }

    public String getUserRoleFromToken(String token) {
        try {
            return (String) Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("role");
        } catch (Exception e) {
            log.error("Error extracting role from token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}