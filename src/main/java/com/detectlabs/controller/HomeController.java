package com.detectlabs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/")
    public String index() {
        return "index"; // Thymeleaf will resolve to src/main/resources/templates/index.html
    }
}
