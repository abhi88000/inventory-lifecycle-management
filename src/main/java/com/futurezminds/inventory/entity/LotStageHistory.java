package com.futurezminds.inventory.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lot_stage_history")
public class LotStageHistory {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "lot_id", nullable = false)
    private Lot lot;

    @ManyToOne
    @JoinColumn(name = "from_stage_id")
    private ProductionStage fromStage;

    @ManyToOne
    @JoinColumn(name = "to_stage_id", nullable = false)
    private ProductionStage toStage;

    private Integer quantity;

    private String notes;

    private String changedBy;

    private OffsetDateTime changedAt;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    public UUID getId() { return id; }
    public Lot getLot() { return lot; }
    public void setLot(Lot lot) { this.lot = lot; }
    public ProductionStage getFromStage() { return fromStage; }
    public void setFromStage(ProductionStage fromStage) { this.fromStage = fromStage; }
    public ProductionStage getToStage() { return toStage; }
    public void setToStage(ProductionStage toStage) { this.toStage = toStage; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public OffsetDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(OffsetDateTime changedAt) { this.changedAt = changedAt; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
