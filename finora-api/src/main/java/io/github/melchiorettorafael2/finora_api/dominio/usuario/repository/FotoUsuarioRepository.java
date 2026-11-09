package io.github.melchiorettorafael2.finora_api.dominio.usuario.repository;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.FotoUsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FotoUsuarioRepository extends JpaRepository<FotoUsuarioEntity, UUID> {
}
