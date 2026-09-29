package com.example.demo.controller;

import com.example.demo.model.BodyMetrics;
import com.example.demo.service.BodyMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/body-metrics")
@CrossOrigin(origins = "http://localhost:5173")
public class BodyMetricsController {

    private final BodyMetricsService bodyMetricsService;

    public BodyMetricsController(BodyMetricsService bodyMetricsService) {
        this.bodyMetricsService = bodyMetricsService;
    }

    @PostMapping
    public ResponseEntity<BodyMetrics> saveBodyMetrics(
            @RequestBody BodyMetrics bodyMetrics) {

        BodyMetrics savedBodyMetrics =
                bodyMetricsService.saveBodyMetrics(bodyMetrics);

        return ResponseEntity.ok(savedBodyMetrics);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BodyMetrics> getBodyMetrics(
            @PathVariable Long userId) {

        BodyMetrics bodyMetrics =
                bodyMetricsService.getBodyMetricsByUserId(userId);

        if (bodyMetrics == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(bodyMetrics);
    }
}