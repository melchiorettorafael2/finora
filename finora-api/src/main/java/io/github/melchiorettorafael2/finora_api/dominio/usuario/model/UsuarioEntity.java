package io.github.melchiorettorafael2.finora_api.dominio.usuario.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "usuario")
@Data
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name="login", unique = true, nullable = false)
    private String login;

    @Column(name="senha", nullable = false)
    private String senha;

    @Column(name="nome", nullable = false)
    private String nome;

    // ===== Autenticação em dois fatores (TOTP / Google Authenticator) =====
    // Colunas anuláveis para o ddl-auto conseguir adicioná-las em tabelas que já têm usuários

    @ToString.Exclude
    @Column(name = "totp_segredo")
    private String totpSegredo;

    // Segredo gerado na configuração, só passa a valer depois de confirmado com um código
    @ToString.Exclude
    @Column(name = "totp_segredo_pendente")
    private String totpSegredoPendente;

    @Column(name = "dois_fatores_ativo")
    private Boolean doisFatoresAtivo;

    // Último passo de tempo aceito: impede reutilizar o mesmo código
    @Column(name = "totp_ultimo_passo")
    private Long totpUltimoPasso;

    public boolean possuiDoisFatoresAtivo() {
        return Boolean.TRUE.equals(doisFatoresAtivo);
    }
}
