package com.lms.config;

import com.lms.filter.RateLimitFilter;
import com.lms.security.JwtAuthenticationEntryPoint;
import com.lms.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired(required = false)
    private RateLimitFilter rateLimitFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Use strength 12 for better security
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API endpoints (using JWT tokens)
            .csrf(AbstractHttpConfigurer::disable)

            // Configure session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )

            // Configure security headers
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                    .preload(true)
                )
                .addHeaderWriter(new XXssProtectionHeaderWriter())
                .addHeaderWriter(new ReferrerPolicyHeaderWriter(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .addHeaderWriter((request, response) -> {
                    response.setHeader("X-Content-Type-Options", "nosniff");
                    response.setHeader("X-Frame-Options", "DENY");
                    response.setHeader("X-XSS-Protection", "1; mode=block");
                    response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
                    response.setHeader("Content-Security-Policy",
                        "default-src 'self'; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self' data:; " +
                        "connect-src 'self'; " +
                        "frame-ancestors 'none';"
                    );
                })
            )

            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/api/actuator/health").permitAll()
                .requestMatchers("/api/actuator/info").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // Public course browsing
                .requestMatchers(HttpMethod.GET, "/api/courses/published").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/*/public").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/featured").permitAll()

                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/cache/**").hasRole("ADMIN")
                .requestMatchers("/api/actuator/**").hasRole("ADMIN")

                // Instructor endpoints
                .requestMatchers("/api/instructor/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/courses").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")

                // Authenticated user endpoints
                .requestMatchers("/api/users/profile").authenticated()
                .requestMatchers("/api/enrollments/**").authenticated()
                .requestMatchers("/api/certificates/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()

                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()

                // Allow all other requests
                .anyRequest().permitAll()
            )

            // Configure exception handling
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            );

        // Add authentication provider
        http.authenticationProvider(authenticationProvider());

        // Add custom filters
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Add rate limiting filter if available
        if (rateLimitFilter != null) {
            http.addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class);
        }

        return http.build();
    }
}
