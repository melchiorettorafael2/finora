package io.github.melchiorettorafael2.finora_api.infra.config;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Migração dos dados criados antes de cada registro ter dono: ao subir a API, tudo que ainda
 * está sem usuário passa para o login configurado em {@code app.migracao.dono-dados-antigos}.
 * Só altera registros sem dono, então pode rodar a cada inicialização sem efeito colateral.
 * Sem a propriedade (ou com um login inexistente), não faz nada.
 */
@Component
public class DonoDadosAntigos implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DonoDadosAntigos.class);

    private static final List<String> ENTIDADES = List.of(
            "CartaoEntity", "CategoriaEntity", "LancamentoEntity", "OrcamentoEntity", "MetaEconomiaEntity");

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Value("${app.migracao.dono-dados-antigos:}")
    private String loginDono;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (loginDono.isBlank()) {
            return;
        }

        var dono = usuarioRepository.findByLogin(loginDono).orElse(null);
        if (dono == null) {
            log.warn("Migração de dados antigos: usuário '{}' não encontrado, nada foi alterado.", loginDono);
            return;
        }

        for (String entidade : ENTIDADES) {
            int alterados = entityManager
                    .createQuery("update " + entidade + " e set e.usuario = :dono where e.usuario is null")
                    .setParameter("dono", dono)
                    .executeUpdate();
            if (alterados > 0) {
                log.info("Migração de dados antigos: {} registro(s) de {} atribuído(s) a '{}'.", alterados, entidade, loginDono);
            }
        }
    }
}
