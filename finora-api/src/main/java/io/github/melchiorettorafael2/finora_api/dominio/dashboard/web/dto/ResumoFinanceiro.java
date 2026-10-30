package io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto;

import java.math.BigDecimal;

public record ResumoFinanceiro(
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo

) {
}
