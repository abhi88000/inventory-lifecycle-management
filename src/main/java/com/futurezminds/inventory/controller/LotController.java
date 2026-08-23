package com.futurezminds.inventory.controller;

import com.futurezminds.inventory.dto.CreateLotRequest;
import com.futurezminds.inventory.dto.MoveLotRequest;
import com.futurezminds.inventory.entity.Lot;
import com.futurezminds.inventory.entity.ProductionStage;
import com.futurezminds.inventory.repository.LotRepository;
import com.futurezminds.inventory.repository.LotStageHistoryRepository;
import com.futurezminds.inventory.repository.ProductionStageRepository;
import com.futurezminds.inventory.repository.RollRepository;
import com.futurezminds.inventory.service.LotService;
import com.futurezminds.inventory.tenant.TenantContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lots")
@Validated
public class LotController {
    private final LotService service;
    private final ProductionStageRepository stageRepository;
    private final LotRepository lotRepository;
    private final LotStageHistoryRepository historyRepository;
    private final RollRepository rollRepository;

    public LotController(LotService service, ProductionStageRepository stageRepository, LotRepository lotRepository, LotStageHistoryRepository historyRepository, RollRepository rollRepository) {
        this.service = service;
        this.stageRepository = stageRepository;
        this.lotRepository = lotRepository;
        this.historyRepository = historyRepository;
        this.rollRepository = rollRepository;
    }

    @PostMapping
    public ResponseEntity<?> createLot(@Valid @RequestBody CreateLotRequest req) {
        try {
            String initialStage = req.getInitialStage() != null ? req.getInitialStage() : "RECEIVED";
            // parse size ratios JSON if provided
            java.util.Map<String,Integer> ratios = null;
            if (req.getSizeRatiosJson() != null && !req.getSizeRatiosJson().isBlank()) {
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                ratios = om.readValue(req.getSizeRatiosJson(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Integer>>(){});
            }
            Double rollLength = null;
            String brand = req.getBrand();
            if (req.getSourceRollNumber() != null && !req.getSourceRollNumber().isBlank()) {
                String tenant = com.futurezminds.inventory.tenant.TenantContext.getTenantId();
                var rollOpt = rollRepository.findByRollNumberAndTenantId(req.getSourceRollNumber(), tenant);
                if (rollOpt.isPresent()) {
                    rollLength = rollOpt.get().getLength();
                    if (brand == null || brand.isBlank()) brand = rollOpt.get().getFabric();
                }
            }

            var lot = service.createLot(req.getLotNumber(), brand, req.getPcs(), req.getFabricator(), initialStage, "system", req.getSourceRollNumber(), req.getFitType(), ratios, rollLength);
            return ResponseEntity.ok(lot);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public List<Lot> listAll() { String tenant = TenantContext.getTenantId(); return lotRepository.findByTenantId(tenant); }

    @GetMapping("/search")
    public List<Lot> search(@RequestParam(name = "q", required = false) String q) {
        String tenant = TenantContext.getTenantId();
        if (q == null || q.trim().isEmpty()) return lotRepository.findByTenantId(tenant);
        return lotRepository.searchByTenant(q.trim(), tenant);
    }

    @GetMapping("/stage/{stageName}")
    public ResponseEntity<?> listByStage(@PathVariable String stageName) {
        return stageRepository.findByName(stageName)
                .map(stage -> ResponseEntity.ok(service.listByStage(stage)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLot(@PathVariable UUID id) {
        var opt = service.getById(id);
        if (opt.isPresent() && TenantContext.getTenantId().equals(opt.get().getTenantId())) return ResponseEntity.ok(opt.get());
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<?> move(@PathVariable UUID id, @Valid @RequestBody MoveLotRequest req) {
        var toStageOpt = stageRepository.findByName(req.getToStage());
        if (toStageOpt.isEmpty()) return ResponseEntity.badRequest().body("Invalid toStage");
        try {
            var updated = service.moveLot(id, toStageOpt.get(), req.getQuantity(), req.getNotes(), "system",
                    req.getFabricator(), req.getWasher(), req.getFinisher());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> history(@PathVariable UUID id) {
        var lotOpt = service.getById(id);
        if (lotOpt.isEmpty()) return ResponseEntity.notFound().build();
        var tenant = TenantContext.getTenantId();
        var hist = historyRepository.findByTenantIdAndLotIdOrderByChangedAtAsc(tenant, id);
        return ResponseEntity.ok(hist);
    }
}
