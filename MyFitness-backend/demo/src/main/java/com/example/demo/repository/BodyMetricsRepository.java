package com.example.demo.repository;

import com.example.demo.model.BodyMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BodyMetricsRepository extends JpaRepository<BodyMetrics, Long> {

    Optional<BodyMetrics> findTopByUserIdOrderByIdDesc(Long userId);
}