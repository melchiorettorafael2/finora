package io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto;

import java.util.List;

/** Tudo o que a tela de Relatórios precisa para o período, em uma única resposta (BFF). */
public record Relatorio(
        int periodo,
        List<ResumoMensal> meses,
        List<CategoriaRelatorio> categorias
) {
}
