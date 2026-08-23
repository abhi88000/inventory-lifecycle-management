package com.example.production.roll;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RollRepository extends JpaRepository<Roll, Long> {
    Optional<Roll> findByRollNumberAndTenantId(String rollNumber, String tenantId);

    java.util.List<Roll> findByTenantId(String tenantId);
}
