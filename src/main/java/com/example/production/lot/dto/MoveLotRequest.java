package com.example.production.lot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MoveLotRequest {
    @NotBlank
    private String toStage;
    @NotNull
    private Integer quantity;
    private String notes;

    public String getToStage() { return toStage; }
    public void setToStage(String toStage) { this.toStage = toStage; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
