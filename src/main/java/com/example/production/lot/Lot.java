package com.example.production.lot;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lots")
public class Lot {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(unique = true, nullable = false)
    private String lotNumber;

    private String brand;

    private Integer originalQuantity;

    private Integer currentQuantity;

    private String fabricator;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    // Source roll information
    @Column(name = "source_roll_number")
    private String sourceRollNumber;

    @Column(name = "roll_length")
    private Double rollLength;

    // JSON strings storing size ratios and computed quantities, e.g. {"30":1,"32":2}
    @Column(name = "size_ratios", columnDefinition = "text")
    private String sizeRatiosJson;

    @Column(name = "size_quantities", columnDefinition = "text")
    private String sizeQuantitiesJson;

    @Column(name = "fit_type")
    private String fitType;

    @ManyToOne
    @JoinColumn(name = "current_stage_id")
    private com.example.production.stage.ProductionStage currentStage;

    private OffsetDateTime createdAt;

    private String createdBy;

    private OffsetDateTime updatedAt;

    private String updatedBy;

    public UUID getId() { return id; }
    public String getLotNumber() { return lotNumber; }
    public void setLotNumber(String lotNumber) { this.lotNumber = lotNumber; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Integer getOriginalQuantity() { return originalQuantity; }
    public void setOriginalQuantity(Integer originalQuantity) { this.originalQuantity = originalQuantity; }
    public Integer getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(Integer currentQuantity) { this.currentQuantity = currentQuantity; }
    public String getFabricator() { return fabricator; }
    public void setFabricator(String fabricator) { this.fabricator = fabricator; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getSourceRollNumber() { return sourceRollNumber; }
    public void setSourceRollNumber(String sourceRollNumber) { this.sourceRollNumber = sourceRollNumber; }
    public Double getRollLength() { return rollLength; }
    public void setRollLength(Double rollLength) { this.rollLength = rollLength; }
    public String getSizeRatiosJson() { return sizeRatiosJson; }
    public void setSizeRatiosJson(String sizeRatiosJson) { this.sizeRatiosJson = sizeRatiosJson; }
    public String getSizeQuantitiesJson() { return sizeQuantitiesJson; }
    public void setSizeQuantitiesJson(String sizeQuantitiesJson) { this.sizeQuantitiesJson = sizeQuantitiesJson; }
    public String getFitType() { return fitType; }
    public void setFitType(String fitType) { this.fitType = fitType; }
    public com.example.production.stage.ProductionStage getCurrentStage() { return currentStage; }
    public void setCurrentStage(com.example.production.stage.ProductionStage currentStage) { this.currentStage = currentStage; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
