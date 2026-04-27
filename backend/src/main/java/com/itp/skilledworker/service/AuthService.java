package com.itp.skilledworker.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.itp.skilledworker.entity.CustomerProfile;
import com.itp.skilledworker.entity.PasswordRecovery;
import com.itp.skilledworker.entity.SupplierProfile;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.entity.WorkerProfile;
import com.itp.skilledworker.repository.CustomerProfileRepository;
import com.itp.skilledworker.repository.PasswordRecoveryRepository;
import com.itp.skilledworker.repository.SupplierProfileRepository;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.repository.WorkerProfileRepository;
import com.itp.skilledworker.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    // Handles account lifecycle operations: register/login/google auth/password recovery.

    @Value("${google.client-id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final SupplierProfileRepository supplierProfileRepository;
    private final PasswordRecoveryRepository passwordRecoveryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private void validatePasswordStrength(String password) {
        if (password == null) {
            throw new RuntimeException("Password is required");
        }

        // At least 8 chars, one lowercase, one uppercase, one symbol
        String pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$";
        if (!password.matches(pattern)) {
            throw new RuntimeException(
                    "Password must be at least 8 characters and include uppercase, lowercase and a symbol");
        }
    }

        @Transactional
        public Map<String, Object> register(String email, String password, String confirmPassword, String role,
            String firstName, String lastName, String phone, String workerCategory) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        if (!password.equals(confirmPassword)) {
            throw new RuntimeException("Passwords do not match");
        }

        validatePasswordStrength(password);

        String normalizedPhone = phone == null ? "" : phone.trim();
        if (!normalizedPhone.isEmpty() && !normalizedPhone.matches("\\d{10}")) {
            throw new RuntimeException("Phone number must be exactly 10 digits");
        }

        User user = new User();
        user.setEmail(email);
        // Persist password as hash; plaintext password is never stored.
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(User.Role.valueOf(role.toLowerCase()));
        user.setPhone(normalizedPhone.isEmpty() ? null : normalizedPhone);
        user.setIsVerified(true); // Auto-verify for demo
        user.setIsActive(true);
        user = userRepository.save(user);

        // Create role-specific profile records for the new account.
        if ("customer".equalsIgnoreCase(role)) {
            CustomerProfile profile = new CustomerProfile();
            profile.setUser(user);
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            customerProfileRepository.save(profile);
        } else if ("worker".equalsIgnoreCase(role)) {
            if (workerCategory == null || workerCategory.isBlank()) {
                throw new RuntimeException("Worker category is required for worker accounts");
            }
            WorkerProfile profile = new WorkerProfile();
            profile.setUser(user);
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            profile.setSkillCategory(workerCategory.trim());
            workerProfileRepository.save(profile);
        } else if ("supplier".equalsIgnoreCase(role)) {
            SupplierProfile profile = new SupplierProfile();
            profile.setUser(user);
            profile.setBusinessName(firstName + " " + lastName + " Supplies");
            profile.setContactPersonName(firstName + " " + lastName);
            supplierProfileRepository.save(profile);
        }

        String token = jwtUtil.generateToken(email, role.toLowerCase());
        return Map.of("token", token, "role", role.toLowerCase(), "userId", user.getUserId(), "email", email);
    }

    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            // Admin-disabled users are blocked from login even with valid credentials.
            throw new RuntimeException("Account is suspended");
        }

        // Track last login for audits/analytics.
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(email, user.getRole().name());
        return Map.of("token", token, "role", user.getRole().name(), "userId", user.getUserId(), "email", email);
    }

        //google-login 
    public Map<String, Object> loginWithGoogle(String idTokenString) {
        try {
            var transport = GoogleNetHttpTransport.newTrustedTransport();
            var jsonFactory = GsonFactory.getDefaultInstance();

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
                    .Builder(transport, jsonFactory)
                    // Accept only tokens issued for this app's Google client id.
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            if (email == null || email.isBlank()) {
                throw new RuntimeException("Email not available from Google account");
            }

            // If the email is not yet registered, signal the frontend to complete registration
            return userRepository.findByEmail(email)
                    .map(user -> {
                        if (!Boolean.TRUE.equals(user.getIsActive())) {
                            throw new RuntimeException("Account is suspended");
                        }

                        user.setLastLogin(LocalDateTime.now());
                        userRepository.save(user);

                        String token = jwtUtil.generateToken(email, user.getRole().name());
                        return Map.<String, Object>of(
                                "token", token,
                                "role", user.getRole().name(),
                                "userId", user.getUserId(),
                                "email", email,
                                "needRegistration", false);
                    })
                    .orElseGet(() -> Map.of(
                            // Frontend uses this to redirect to registration with prefilled email.
                            "email", email,
                            "needRegistration", true));
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to verify Google ID token");
        } catch (Exception e) {
            // Propagate the original message so the client can see what went wrong
            throw new RuntimeException(e.getMessage() != null ? e.getMessage() : "Google login failed");
        }
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String token = UUID.randomUUID().toString();
        // One-time token persisted with expiry for reset validation.
        PasswordRecovery recovery = new PasswordRecovery();
        recovery.setUser(user);
        recovery.setRecoveryToken(token);
        recovery.setTokenExpiry(LocalDateTime.now().plusHours(24));
        passwordRecoveryRepository.save(recovery);

        // In real app: send email with reset link
        // For demo: return token directly
        return "Password reset token (for demo): " + token;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordRecovery recovery = passwordRecoveryRepository.findByRecoveryToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (recovery.getIsUsed()) {
            throw new RuntimeException("Token already used");
        }
        if (recovery.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        // Apply the reset only after validation passes.
        validatePasswordStrength(newPassword);

        User user = recovery.getUser();
        // Replace old hash with new hash after token + policy checks.
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        recovery.setIsUsed(true);
        passwordRecoveryRepository.save(recovery);
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new RuntimeException("Current password is required");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        validatePasswordStrength(newPassword);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
