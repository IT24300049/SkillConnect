package com.itp.skilledworker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.verification-dir:uploads/verification}")
    private String verificationDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path verificationPath = Paths.get(verificationDir).toAbsolutePath().normalize();
        Path root = verificationPath.getParent();
        if (root != null) {
            String location = root.toUri().toString();
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(location);
        }
    }
}
