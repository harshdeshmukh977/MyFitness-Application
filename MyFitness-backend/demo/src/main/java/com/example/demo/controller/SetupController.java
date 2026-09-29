package com.example.demo.controller;

import com.example.demo.model.Setup;
import com.example.demo.service.SetupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "http://localhost:5173")
public class SetupController {

    private final SetupService setupService;

    public SetupController(SetupService setupService) {
        this.setupService = setupService;
    }

    @PostMapping
    public ResponseEntity<Setup> saveSetup(@RequestBody Setup setup) {

        Setup savedSetup = setupService.saveSetup(setup);

        return ResponseEntity.ok(savedSetup);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Setup> getSetup(@PathVariable Long userId) {

        Setup setup = setupService.getSetupByUserId(userId);

        if (setup == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(setup);
    }
}