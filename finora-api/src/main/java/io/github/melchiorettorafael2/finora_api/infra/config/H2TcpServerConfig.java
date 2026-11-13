package io.github.melchiorettorafael2.finora_api.infra.config;

import org.h2.tools.Server;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.SQLException;

/**
 * Servidor TCP do H2 para ferramentas externas (DBeaver) lerem o banco ao vivo.
 * O banco roda embutido na API; este servidor, no mesmo processo, compartilha a mesma instância
 * aberta (sem conflito de trava de arquivo).
 *
 * Só sobe com app.h2.tcp=true (em produção, H2_CONSOLE=true no .env). A porta 9092 é publicada
 * apenas no localhost do servidor (docker-compose.yml), então o acesso exige túnel SSH.
 */
@Configuration
@ConditionalOnProperty(name = "app.h2.tcp", havingValue = "true")
public class H2TcpServerConfig {

    @Bean(initMethod = "start", destroyMethod = "stop")
    public Server h2TcpServer() throws SQLException {
        return Server.createTcpServer(
                "-tcp", "-tcpPort", "9092",
                // pelo túnel a conexão chega do gateway do Docker, não de 127.0.0.1
                "-tcpAllowOthers",
                // não deixa criar bancos novos remotamente: só abre os que já existem
                "-ifExists");
    }
}
