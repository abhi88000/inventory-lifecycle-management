package com.example.production.lot;

import com.example.production.history.LotStageHistoryRepository;
import com.example.production.lot.dto.CreateLotRequest;
import com.example.production.lot.dto.MoveLotRequest;
import com.example.production.stage.ProductionStage;
import com.example.production.stage.ProductionStageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.example.production.tenant.TenantContext;

@RestController
@RequestMapping("/api/lots")
@Validated
public class LotController {
    private final LotService service;
    private final ProductionStageRepository stageRepository;
    private final LotRepository lotRepository;
    private final LotStageHistoryRepository historyRepository;
    private final com.example.production.roll.RollRepository rollRepository;

    public LotController(LotService service, ProductionStageRepository stageRepository, LotRepository lotRepository, LotStageHistoryRepository historyRepository, com.example.production.roll.RollRepository rollRepository) {
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
                String tenant = com.example.production.tenant.TenantContext.getTenantId();
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
            var updated = service.moveLot(id, toStageOpt.get(), req.getQuantity(), req.getNotes(), "system");
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
