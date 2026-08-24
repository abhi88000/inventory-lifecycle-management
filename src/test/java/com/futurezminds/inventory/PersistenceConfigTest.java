package com.futurezminds.inventory;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class PersistenceConfigTest {

    @Test
    void usesPostgresAndFlywayDefaults() throws IOException {
        Properties props = new Properties();
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            assertThat(in).isNotNull();
            props.load(in);
        }

        assertThat(props.getProperty("spring.datasource.url")).contains("jdbc:postgresql://");
        assertThat(props.getProperty("spring.datasource.driver-class-name")).isEqualTo("org.postgresql.Driver");
        assertThat(props.getProperty("spring.flyway.enabled")).isEqualTo("true");
        assertThat(props.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
    }
}
