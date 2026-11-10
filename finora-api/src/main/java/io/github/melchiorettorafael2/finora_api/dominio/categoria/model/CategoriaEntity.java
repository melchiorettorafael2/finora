package io.github.melchiorettorafael2.finora_api.dominio.categoria.model;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "categoria")
@Getter
@Setter
public class CategoriaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "ativo")
    private Boolean ativo = true;

    // Dono do registro: cada usuário só enxerga os próprios dados.
    // Coluna anulável para o ddl-auto conseguir adicioná-la em tabelas que já têm registros
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private UsuarioEntity usuario;
}
