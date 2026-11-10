package io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository;

import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.MetaEconomiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Todas as consultas filtram pelo dono: um usuário nunca enxerga as metas de outro
public interface MetaEconomiaRepository extends JpaRepository<MetaEconomiaEntity, UUID> {

    Optional<MetaEconomiaEntity> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    List<MetaEconomiaEntity> findAllByUsuarioIdOrderByPrazoAsc(UUID usuarioId);
}
