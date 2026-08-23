package com.futurezminds.inventory.repository;

import com.futurezminds.inventory.entity.Lot;
import com.futurezminds.inventory.entity.ProductionStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LotRepository extends JpaRepository<Lot, UUID> {
    Optional<Lot> findByLotNumberAndTenantId(String lotNumber, String tenantId);
    List<Lot> findByCurrentStageAndTenantId(ProductionStage stage, String tenantId);

    @Query("select l from Lot l left join l.currentStage s where " +
            "lower(l.lotNumber) like lower(concat('%', :q, '%')) or " +
            "lower(l.brand) like lower(concat('%', :q, '%')) or " +
            "lower(l.fabricator) like lower(concat('%', :q, '%')) or " +
            "lower(s.name) like lower(concat('%', :q, '%'))")
        List<Lot> search(@Param("q") String q);

        @Query("select l from Lot l left join l.currentStage s where (" +
            "lower(l.lotNumber) like lower(concat('%', :q, '%')) or " +
            "lower(l.brand) like lower(concat('%', :q, '%')) or " +
            "lower(l.fabricator) like lower(concat('%', :q, '%')) or " +
            "lower(s.name) like lower(concat('%', :q, '%'))) and l.tenantId = :tenant")
        List<Lot> searchByTenant(@Param("q") String q, @Param("tenant") String tenant);

        List<Lot> findByTenantId(String tenantId);
}
