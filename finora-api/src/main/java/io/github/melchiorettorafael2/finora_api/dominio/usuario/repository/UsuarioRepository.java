package io.github.melchiorettorafael2.finora_api.dominio.usuario.repository;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, UUID> {

    Optional<UsuarioEntity>  findByLogin(String login);

    boolean existsByLogin(String login);
}
