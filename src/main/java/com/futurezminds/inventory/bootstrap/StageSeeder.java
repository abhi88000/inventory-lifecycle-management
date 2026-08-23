package com.futurezminds.inventory.bootstrap;

import com.futurezminds.inventory.entity.ProductionStage;
import com.futurezminds.inventory.repository.ProductionStageRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StageSeeder implements ApplicationRunner {
    private final ProductionStageRepository repo;
    public StageSeeder(ProductionStageRepository repo){ this.repo = repo; }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (repo.count() == 0) {
            String[] stages = new String[]{"RECEIVED","CUTTING","STITCHING","WASHING","FINISHING","PACKING","COMPLETED","DISPATCHED"};
            int i=0;
            for(String s: stages){
                ProductionStage p = new ProductionStage(); p.setName(s); p.setSortOrder(i++); repo.save(p);
            }
        }
    }
}
