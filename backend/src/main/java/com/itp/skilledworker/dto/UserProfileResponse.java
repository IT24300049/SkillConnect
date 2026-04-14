package com.itp.skilledworker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private Integer userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String phone;
    private String city;
    private String district;
    private String profilePicture;
    private String bio;
    private BigDecimal hourlyRateMin;
    private BigDecimal hourlyRateMax;
    private Double averageRating;
    private String businessName;
    private String businessRegistrationNumber;
    private String contactPersonName;
}
