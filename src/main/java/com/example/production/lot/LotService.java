package com.example.production.lot;

import com.example.production.history.LotStageHistory;
import com.example.production.history.LotStageHistoryRepository;
import com.example.production.stage.ProductionStage;
import com.example.production.stage.ProductionStageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.production.tenant.TenantContext;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LotService {
    private final LotRepository lotRepository;
    private final ProductionStageRepository stageRepository;
    private final LotStageHistoryRepository historyRepository;

    public LotService(LotRepository lotRepository, ProductionStageRepository stageRepository, LotStageHistoryRepository historyRepository) {
        this.lotRepository = lotRepository;
        this.stageRepository = stageRepository;
        this.historyRepository = historyRepository;
    }

    public Lot createLot(String lotNumber, String brand, Integer pcs, String fabricator, String initialStageName, String user,
                         String sourceRollNumber, String fitType, java.util.Map<String,Integer> sizeRatios, Double rollLength) {
        Lot lot = new Lot();
        String tenant = TenantContext.getTenantId();
        if (tenant == null) throw new IllegalStateException("Missing tenant in context");
        lot.setLotNumber(lotNumber);
        lot.setBrand(brand);
        lot.setOriginalQuantity(pcs);
        lot.setCurrentQuantity(pcs);
        lot.setFabricator(fabricator);
        lot.setTenantId(tenant);
        lot.setSourceRollNumber(sourceRollNumber);
        lot.setFitType(fitType);
        lot.setRollLength(rollLength);

        // compute size quantities from ratios
        java.util.Map<String,Integer> sizeQuantities = new java.util.HashMap<>();
        if (sizeRatios != null && !sizeRatios.isEmpty()) {
            int totalRatio = sizeRatios.values().stream().mapToInt(Integer::intValue).sum();
            for (var e : sizeRatios.entrySet()) {
                int qty = 0;
                if (totalRatio > 0) qty = Math.round((float)pcs * e.getValue() / totalRatio);
                sizeQuantities.put(e.getKey(), qty);
            }
            try {
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                lot.setSizeRatiosJson(om.writeValueAsString(sizeRatios));
                lot.setSizeQuantitiesJson(om.writeValueAsString(sizeQuantities));
            } catch (Exception ex) {
                // ignore
            }
        }

        ProductionStage stage = stageRepository.findByName(initialStageName).orElse(null);
        if (stage == null) {
            // ensure a stage row exists (seed when Flyway disabled in demo)
            ProductionStage s = new ProductionStage();
            s.setName(initialStageName != null ? initialStageName : "RECEIVED");
            s.setSortOrder(0);
            stage = stageRepository.save(s);
        }
        lot.setCurrentStage(stage);
        lot.setCreatedAt(OffsetDateTime.now());
        lot.setCreatedBy(user);
        Lot saved = lotRepository.save(lot);

        LotStageHistory h = new LotStageHistory();
        h.setLot(saved);
        h.setFromStage(null);
        h.setToStage(stage);
        h.setQuantity(pcs);
        h.setChangedAt(OffsetDateTime.now());
        h.setChangedBy(user);
        h.setTenantId(tenant);
        historyRepository.save(h);

        return saved;
    }

    public List<Lot> listByStage(ProductionStage stage) {
        String tenant = TenantContext.getTenantId();
        return lotRepository.findByCurrentStageAndTenantId(stage, tenant);
    }

    public Optional<Lot> getById(UUID id) { return lotRepository.findById(id); }

    @Transactional
    public Lot moveLot(UUID lotId, ProductionStage toStage, int quantity, String notes, String user) {
        String tenant = TenantContext.getTenantId();
        Lot lot = lotRepository.findById(lotId).orElseThrow(() -> new IllegalArgumentException("Lot not found"));
        if (!tenant.equals(lot.getTenantId())) throw new IllegalArgumentException("Lot not found");
        ProductionStage from = lot.getCurrentStage();

        // update current quantity (simple subtraction for moved quantity)
        int remaining = (lot.getCurrentQuantity() == null ? 0 : lot.getCurrentQuantity()) - quantity;
        lot.setCurrentQuantity(Math.max(remaining, 0));
        lot.setCurrentStage(toStage);
        lot.setUpdatedAt(OffsetDateTime.now());
        lot.setUpdatedBy(user);
        lotRepository.save(lot);

        LotStageHistory h = new LotStageHistory();
        h.setLot(lot);
        h.setFromStage(from);
        h.setToStage(toStage);
        h.setQuantity(quantity);
        h.setNotes(notes);
        h.setChangedAt(OffsetDateTime.now());
        h.setChangedBy(user);
        historyRepository.save(h);

        return lot;
    }
}
