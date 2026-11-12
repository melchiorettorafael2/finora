package io.github.melchiorettorafael2.finora_api.dominio.categoria.repository;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Todas as consultas filtram pelo dono: um usuário nunca enxerga as categorias de outro
public interface CategoriaRepository extends JpaRepository<CategoriaEntity, UUID> {

    Optional<CategoriaEntity> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    Page<CategoriaEntity> findAllByUsuarioId(UUID usuarioId, Pageable pageable);

    boolean existsByNomeAndUsuarioId(String nome, UUID usuarioId);

    // Na edição a própria categoria não conta como duplicada
    boolean existsByNomeAndUsuarioIdAndIdNot(String nome, UUID usuarioId, UUID id);

    List<CategoriaEntity> findByAtivoTrueAndUsuarioId(UUID usuarioId);
}
