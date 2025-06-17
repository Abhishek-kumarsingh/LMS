package com.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ModernLmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ModernLmsApplication.class, args);
    }

}
