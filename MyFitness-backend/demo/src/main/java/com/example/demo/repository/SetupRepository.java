package com.example.demo.repository;

import com.example.demo.model.Setup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SetupRepository extends JpaRepository<Setup, Long> {

    Optional<Setup> findByUserId(Long userId);
}