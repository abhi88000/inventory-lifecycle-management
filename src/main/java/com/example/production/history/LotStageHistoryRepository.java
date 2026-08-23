package com.example.production.history;

import com.example.production.lot.Lot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LotStageHistoryRepository extends JpaRepository<LotStageHistory, UUID> {
    List<LotStageHistory> findByLotOrderByChangedAtAsc(Lot lot);

    List<LotStageHistory> findByTenantIdAndLotIdOrderByChangedAtAsc(String tenantId, java.util.UUID lotId);
}
