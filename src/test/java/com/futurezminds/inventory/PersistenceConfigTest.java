package com.futurezminds.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class PersistenceConfigTest {

    @Autowired
    private Environment environment;

    @Test
    void usesPersistentFileDatabaseAndUpdateMode() {
        String url = environment.getProperty("spring.datasource.url");
        String ddlAuto = environment.getProperty("spring.jpa.hibernate.ddl-auto");

        assertThat(url).contains("jdbc:h2:file:");
        assertThat(ddlAuto).isEqualTo("update");
    }
}
