package com.lerner.i27eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableEurekaServer
@ComponentScan(basePackages = "com.lerner.i27eureka")
public class I27EurekaApplication {
    public static void main(String[] args) {
        SpringApplication.run(I27EurekaApplication.class, args);
    }
}
