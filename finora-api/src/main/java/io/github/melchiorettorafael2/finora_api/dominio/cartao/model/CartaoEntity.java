package io.github.melchiorettorafael2.finora_api.dominio.cartao.model;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cartao")
@Getter
@Setter
public class CartaoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", nullable = false, length = 50)
    private String nome;

    @Column(name = "bandeira", length = 20)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private BandeiraCartao bandeira;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @PrePersist
    public void prePersist(){
        setDataCadastro(LocalDateTime.now());
    }

    @Column(name = "ativo")
    private Boolean ativo = true;

    // Dono do registro: cada usuário só enxerga os próprios dados.
    // Coluna anulável para o ddl-auto conseguir adicioná-la em tabelas que já têm registros
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private UsuarioEntity usuario;
}
