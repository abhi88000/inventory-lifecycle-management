package com.example.production.stage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductionStageRepository extends JpaRepository<ProductionStage, Long> {
    Optional<ProductionStage> findByName(String name);
}
