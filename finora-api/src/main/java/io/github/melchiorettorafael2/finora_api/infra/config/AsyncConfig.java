package io.github.melchiorettorafael2.finora_api.infra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

// Habilita @Async (envio de e-mail em segundo plano) e @Scheduled (restauração diária da conta demo)
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
