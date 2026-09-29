package com.example.demo.service;

import com.example.demo.model.BodyMetrics;
import com.example.demo.repository.BodyMetricsRepository;
import org.springframework.stereotype.Service;

@Service
public class BodyMetricsService {

    private final BodyMetricsRepository bodyMetricsRepository;

    public BodyMetricsService(BodyMetricsRepository bodyMetricsRepository) {
        this.bodyMetricsRepository = bodyMetricsRepository;
    }

    public BodyMetrics saveBodyMetrics(BodyMetrics bodyMetrics) {
        return bodyMetricsRepository.save(bodyMetrics);
    }

    public BodyMetrics getBodyMetricsByUserId(Long userId) {
        return bodyMetricsRepository
                .findTopByUserIdOrderByIdDesc(userId)
                .orElse(null);
    }
}