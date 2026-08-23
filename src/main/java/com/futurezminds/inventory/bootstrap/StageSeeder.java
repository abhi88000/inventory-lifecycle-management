package com.futurezminds.inventory.bootstrap;

import com.futurezminds.inventory.entity.Lot;
import com.futurezminds.inventory.entity.ProductionStage;
import com.futurezminds.inventory.entity.Roll;
import com.futurezminds.inventory.repository.LotRepository;
import com.futurezminds.inventory.repository.ProductionStageRepository;
import com.futurezminds.inventory.repository.RollRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Map;

@Component
public class StageSeeder implements ApplicationRunner {
    private final ProductionStageRepository repo;
    private final RollRepository rollRepository;
    private final LotRepository lotRepository;

    public StageSeeder(ProductionStageRepository repo, RollRepository rollRepository, LotRepository lotRepository) {
        this.repo = repo;
        this.rollRepository = rollRepository;
        this.lotRepository = lotRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repo.count() == 0) {
            String[] stages = new String[]{"RECEIVED","CUTTING","STITCHING","WASHING","FINISHING","PACKING","COMPLETED","DISPATCHED"};
            int i = 0;
            for (String s : stages) {
                ProductionStage p = new ProductionStage();
                p.setName(s);
                p.setSortOrder(i++);
                repo.save(p);
            }
        }

        if (rollRepository.count() == 0) {
            seedRolls();
        }

        if (lotRepository.count() == 0) {
            seedLots();
        }
    }

    private void seedRolls() {
        String[] fabrics = {"Denim", "Cotton", "Stretch", "Washed Denim", "Polyester"};
        for (int i = 1; i <= 8; i++) {
            Roll roll = new Roll();
            roll.setRollNumber("R-" + String.format("%03d", i));
            roll.setFabric(fabrics[(i - 1) % fabrics.length]);
            roll.setLength(90.0 + (i * 12.5));
            roll.setTenantId("demo");
            rollRepository.save(roll);
        }
    }

    private void seedLots() {
        ProductionStage stitching = repo.findByName("STITCHING").orElseThrow();
        ProductionStage washing = repo.findByName("WASHING").orElseThrow();

        String[] brands = {"FutureZ", "BluePeak", "UrbanThread", "Northline", "DenimWorks"};

        for (int i = 1; i <= 5; i++) {
            Lot lot = new Lot();
            lot.setLotNumber("LOT-ST-" + String.format("%03d", i));
            lot.setBrand(brands[(i - 1) % brands.length]);
            lot.setOriginalQuantity(180 + (i * 25));
            lot.setCurrentQuantity(180 + (i * 25));
            lot.setFabricator("Fabricator " + (i % 3 + 1));
            lot.setWasher(null);
            lot.setFinisher(null);
            lot.setTenantId("demo");
            lot.setSourceRollNumber("R-" + String.format("%03d", (i % 8 + 1)));
            lot.setFitType(i % 2 == 0 ? "Slim" : "Regular");
            lot.setRollLength(120.0 + i * 10.0);
            lot.setSizeRatiosJson("{\"30\":1,\"32\":2,\"34\":2,\"36\":1}");
            lot.setSizeQuantitiesJson("{\"30\":40,\"32\":80,\"34\":80,\"36\":40}");
            lot.setCurrentStage(stitching);
            lot.setCreatedAt(OffsetDateTime.now().minusDays(2));
            lot.setCreatedBy("demo-seeder");
            lotRepository.save(lot);
        }

        for (int i = 1; i <= 20; i++) {
            Lot lot = new Lot();
            lot.setLotNumber("LOT-WA-" + String.format("%03d", i));
            lot.setBrand(brands[(i - 1) % brands.length]);
            lot.setOriginalQuantity(220 + (i * 15));
            lot.setCurrentQuantity(220 + (i * 15));
            lot.setFabricator("Fabricator " + ((i % 4) + 1));
            lot.setWasher("Wash Team " + ((i % 5) + 1));
            lot.setFinisher(null);
            lot.setTenantId("demo");
            lot.setSourceRollNumber("R-" + String.format("%03d", (i % 8 + 1)));
            lot.setFitType(i % 3 == 0 ? "Relaxed" : "Regular");
            lot.setRollLength(140.0 + i * 8.0);
            lot.setSizeRatiosJson("{\"30\":2,\"32\":3,\"34\":3,\"36\":2}");
            lot.setSizeQuantitiesJson("{\"30\":60,\"32\":90,\"34\":90,\"36\":60}");
            lot.setCurrentStage(washing);
            lot.setCreatedAt(OffsetDateTime.now().minusDays(1));
            lot.setCreatedBy("demo-seeder");
            lotRepository.save(lot);
        }
    }
}
