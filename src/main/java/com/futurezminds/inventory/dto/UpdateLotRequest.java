package com.futurezminds.inventory.dto;

// Partial update for lot metadata (does not change stage). All fields optional —
// only non-null fields are applied. Used to correct mistakes made during a stage move
// (e.g. wrong fabricator/washer/finisher name, wrong fit type, wrong piece count).
public class UpdateLotRequest {
    private String brand;
    private String fitType;
    private String fabricator;
    private String washer;
    private String finisher;
    private Integer currentQuantity;

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getFitType() { return fitType; }
    public void setFitType(String fitType) { this.fitType = fitType; }
    public String getFabricator() { return fabricator; }
    public void setFabricator(String fabricator) { this.fabricator = fabricator; }
    public String getWasher() { return washer; }
    public void setWasher(String washer) { this.washer = washer; }
    public String getFinisher() { return finisher; }
    public void setFinisher(String finisher) { this.finisher = finisher; }
    public Integer getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(Integer currentQuantity) { this.currentQuantity = currentQuantity; }
}
