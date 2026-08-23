package com.futurezminds.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MoveLotRequest {
    @NotBlank
    private String toStage;
    @NotNull
    private Integer quantity;
    private String notes;
    private String fabricator;
    private String washer;
    private String finisher;

    public String getToStage() { return toStage; }
    public void setToStage(String toStage) { this.toStage = toStage; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getFabricator() { return fabricator; }
    public void setFabricator(String fabricator) { this.fabricator = fabricator; }
    public String getWasher() { return washer; }
    public void setWasher(String washer) { this.washer = washer; }
    public String getFinisher() { return finisher; }
    public void setFinisher(String finisher) { this.finisher = finisher; }
}
