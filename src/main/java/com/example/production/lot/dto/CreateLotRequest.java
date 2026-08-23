package com.example.production.lot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateLotRequest {
    @NotBlank
    private String lotNumber;
    private String brand;
    @NotNull
    private Integer pcs;
    private String fabricator;
    private String initialStage;
    private String sourceRollNumber;
    private String fitType;
    // size ratios as simple JSON-like map string or client may send as object; we'll accept raw JSON string here
    private String sizeRatiosJson;

    public String getLotNumber() { return lotNumber; }
    public void setLotNumber(String lotNumber) { this.lotNumber = lotNumber; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Integer getPcs() { return pcs; }
    public void setPcs(Integer pcs) { this.pcs = pcs; }
    public String getFabricator() { return fabricator; }
    public void setFabricator(String fabricator) { this.fabricator = fabricator; }
    public String getInitialStage() { return initialStage; }
    public void setInitialStage(String initialStage) { this.initialStage = initialStage; }
    public String getSourceRollNumber() { return sourceRollNumber; }
    public void setSourceRollNumber(String sourceRollNumber) { this.sourceRollNumber = sourceRollNumber; }
    public String getFitType() { return fitType; }
    public void setFitType(String fitType) { this.fitType = fitType; }
    public String getSizeRatiosJson() { return sizeRatiosJson; }
    public void setSizeRatiosJson(String sizeRatiosJson) { this.sizeRatiosJson = sizeRatiosJson; }
}
