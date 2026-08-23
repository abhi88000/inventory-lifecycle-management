package com.futurezminds.inventory.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rolls")
public class Roll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_number", nullable = false, unique = true)
    private String rollNumber;

    private String fabric;

    private Double length; // in meters

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    public Long getId() { return id; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getFabric() { return fabric; }
    public void setFabric(String fabric) { this.fabric = fabric; }
    public Double getLength() { return length; }
    public void setLength(Double length) { this.length = length; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
