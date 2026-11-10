package io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository;

import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.OrcamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrcamentoRepository extends JpaRepository<OrcamentoEntity, UUID> {

    Optional<OrcamentoEntity> findByCategoriaId(UUID categoriaId);

    List<OrcamentoEntity> findAllByOrderByCategoriaNomeAsc();
}
