package com.futurezminds.inventory.controller;

import com.futurezminds.inventory.entity.Roll;
import com.futurezminds.inventory.repository.RollRepository;
import com.futurezminds.inventory.tenant.TenantContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rolls")
@Validated
public class RollController {
    private final RollRepository rollRepository;

    public RollController(RollRepository rollRepository) {
        this.rollRepository = rollRepository;
    }

    @GetMapping
    public ResponseEntity<?> listRolls() {
        String tenant = TenantContext.getTenantId();
        if (tenant == null) return ResponseEntity.status(400).body("Missing tenant");
        var rolls = rollRepository.findByTenantId(tenant);
        return ResponseEntity.ok(rolls);
    }

    @PostMapping
    public ResponseEntity<?> createRoll(@Valid @RequestBody Roll payload) {
        String tenant = TenantContext.getTenantId();
        if (tenant == null) return ResponseEntity.status(400).body("Missing tenant");
        payload.setTenantId(tenant);
        // ensure unique roll_number per tenant not enforced here; repository/save will fail on DB unique constraint
        var saved = rollRepository.save(payload);
        return ResponseEntity.ok(saved);
    }
}
