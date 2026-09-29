package com.example.demo.service;

import com.example.demo.model.Setup;
import com.example.demo.repository.SetupRepository;
import org.springframework.stereotype.Service;

@Service
public class SetupService {

    private final SetupRepository setupRepository;

    public SetupService(SetupRepository setupRepository) {
        this.setupRepository = setupRepository;
    }

    public Setup saveSetup(Setup setup) {
        return setupRepository.save(setup);
    }

    public Setup getSetupByUserId(Long userId) {
        return setupRepository.findByUserId(userId)
                .orElse(null);
    }
}