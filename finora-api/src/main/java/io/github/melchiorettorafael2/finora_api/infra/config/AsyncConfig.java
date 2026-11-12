package io.github.melchiorettorafael2.finora_api.infra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

// Habilita @Async (envio de e-mail em segundo plano)
@Configuration
@EnableAsync
public class AsyncConfig {
}
