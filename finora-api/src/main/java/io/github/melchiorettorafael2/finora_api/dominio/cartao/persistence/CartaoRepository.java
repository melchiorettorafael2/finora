package io.github.melchiorettorafael2.finora_api.dominio.cartao.persistence;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Todas as consultas filtram pelo dono: um usuário nunca enxerga os cartões de outro
public interface CartaoRepository extends JpaRepository<CartaoEntity, UUID>{

    Optional<CartaoEntity> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    Page<CartaoEntity> findAllByUsuarioId(UUID usuarioId, Pageable pageable);

    // Nome já usado por outro cartão do mesmo usuário (na edição, ignora o próprio cartão)
    @Query("""
        select c
        from CartaoEntity c where ( :id is null or c.id != :id)
        and c.nome = :nome
        and c.usuario.id = :usuarioId
""")
    List<CartaoEntity> findByNomeAndNotId(
            @Param("nome") String nome, @Param("id") UUID id, @Param("usuarioId") UUID usuarioId);

    List<CartaoEntity> findByAtivoTrueAndUsuarioId(UUID usuarioId);
}
