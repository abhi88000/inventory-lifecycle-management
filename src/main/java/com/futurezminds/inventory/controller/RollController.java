package com.futurezminds.inventory.controller;

import com.futurezminds.inventory.entity.Roll;
import com.futurezminds.inventory.repository.RollRepository;
import com.futurezminds.inventory.tenant.TenantContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

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
        payload.setCreatedAt(OffsetDateTime.now());
        // ensure unique roll_number per tenant not enforced here; repository/save will fail on DB unique constraint
        var saved = rollRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    // Deletes a roll from inventory (e.g. entered by mistake, or no longer usable).
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoll(@PathVariable Long id) {
        String tenant = TenantContext.getTenantId();
        if (tenant == null) return ResponseEntity.status(400).body("Missing tenant");
        var opt = rollRepository.findById(id);
        if (opt.isEmpty() || !tenant.equals(opt.get().getTenantId())) return ResponseEntity.notFound().build();
        rollRepository.delete(opt.get());
        return ResponseEntity.noContent().build();
    }
}
