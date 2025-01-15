package com.lerner.i27eureka.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        RequestMatcher[] publicPaths = {
            new AntPathRequestMatcher("/eureka/**"),
            new AntPathRequestMatcher("/actuator/**"),
            new AntPathRequestMatcher("/"),
            new AntPathRequestMatcher("/dashboard/**"),
            new AntPathRequestMatcher("/css/**"),
            new AntPathRequestMatcher("/js/**"),
            new AntPathRequestMatcher("/*.html"),
            new AntPathRequestMatcher("/favicon.ico"),
            new AntPathRequestMatcher("/fonts/**"),
            new AntPathRequestMatcher("/images/**"),
            new AntPathRequestMatcher("/error")
        };

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> 
                auth
                    .requestMatchers(publicPaths).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/eureka/apps/**")).permitAll()
                    .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
