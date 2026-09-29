package com.example.demo.config;

import com.example.demo.model.Achievement;
import com.example.demo.repository.AchievementRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AchievementDataInitializer {

    @Bean
    CommandLineRunner seedAchievements(AchievementRepository repository) {
        return args -> {

            seed(repository, "CONSISTENCY", "Consistency",
                    "Completed workouts for 7 days.", 7, "STREAK", "🔥");

            seed(repository, "FIRST_WORKOUT", "Strong Start",
                    "Complete your first workout.", 1, "COUNT", "⚡");

            seed(repository, "MOMENTUM", "Momentum",
                    "Complete 10 workout sessions.", 10, "COUNT", "✦");

            seed(repository, "DEDICATED", "Dedicated",
                    "Stay consistent for 30 days.", 30, "STREAK", "◇");
        };
    }

    private void seed(
            AchievementRepository repository,
            String code,
            String name,
            String description,
            int target,
            String type,
            String icon
    ) {
        if (repository.findByCode(code).isPresent()) {
            return;
        }

        Achievement a = new Achievement();

        a.setCode(code);
        a.setName(name);
        a.setDescription(description);
        a.setTarget(target);
        a.setType(type);
        a.setIcon(icon);

        repository.save(a);
    }
}