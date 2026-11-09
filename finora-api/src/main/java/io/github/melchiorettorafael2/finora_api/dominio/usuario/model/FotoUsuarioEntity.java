package io.github.melchiorettorafael2.finora_api.dominio.usuario.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

// Fica numa tabela própria para a foto não ser carregada junto com o usuário
// em toda requisição autenticada (o AuthInterceptor busca o usuário a cada request)
@Entity
@Table(name = "foto_usuario")
@Data
public class FotoUsuarioEntity {

    @Id
    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Lob
    @ToString.Exclude
    @Column(name = "conteudo", nullable = false)
    private byte[] conteudo;

    @Column(name = "content_type", nullable = false)
    private String contentType;
}
