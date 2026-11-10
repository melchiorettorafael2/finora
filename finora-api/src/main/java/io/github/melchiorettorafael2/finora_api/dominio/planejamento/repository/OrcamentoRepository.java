package io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository;

import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.OrcamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Todas as consultas filtram pelo dono: um usuário nunca enxerga os orçamentos de outro
public interface OrcamentoRepository extends JpaRepository<OrcamentoEntity, UUID> {

    Optional<OrcamentoEntity> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    Optional<OrcamentoEntity> findByCategoriaIdAndUsuarioId(UUID categoriaId, UUID usuarioId);

    List<OrcamentoEntity> findAllByUsuarioIdOrderByCategoriaNomeAsc(UUID usuarioId);
}
