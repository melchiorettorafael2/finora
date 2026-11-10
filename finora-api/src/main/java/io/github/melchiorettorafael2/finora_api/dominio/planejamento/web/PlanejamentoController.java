package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.service.CategoriaService;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.service.MetaEconomiaService;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.service.OrcamentoService;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.service.PlanejamentoService;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.MetaEconomiaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.MetaEconomiaForm;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.OrcamentoForm;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.Planejamento;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("planejamento")
public class PlanejamentoController {

    @Autowired
    private PlanejamentoService service;
    @Autowired
    private OrcamentoService orcamentoService;
    @Autowired
    private MetaEconomiaService metaService;
    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public Planejamento obter(@RequestParam(value = "mes", required = false) String mes) {
        return service.obter(parseMes(mes));
    }

    @GetMapping("categorias-disponiveis")
    public List<CategoriaDetalhes> listarCategoriasDisponiveis() {
        return categoriaService.listarAtivas();
    }

    /** Cria o limite da categoria ou atualiza o existente. */
    @PutMapping("orcamentos")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void definirOrcamento(@RequestBody @Valid OrcamentoForm form) {
        orcamentoService.definir(form);
    }

    @DeleteMapping("orcamentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerOrcamento(@PathVariable UUID id) {
        orcamentoService.remover(id);
    }

    // ===== Metas de economia =====

    @PostMapping("metas")
    @ResponseStatus(HttpStatus.CREATED)
    public MetaEconomiaDetalhes criarMeta(@RequestBody @Valid MetaEconomiaForm form) {
        return metaService.criar(form);
    }

    @GetMapping("metas/{id}")
    public MetaEconomiaDetalhes buscarMeta(@PathVariable UUID id) {
        return metaService.buscar(id);
    }

    @PutMapping("metas/{id}")
    public MetaEconomiaDetalhes atualizarMeta(@PathVariable UUID id, @RequestBody @Valid MetaEconomiaForm form) {
        return metaService.atualizar(id, form);
    }

    @DeleteMapping("metas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerMeta(@PathVariable UUID id) {
        metaService.remover(id);
    }

    private YearMonth parseMes(String mes) {
        if (mes == null || mes.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(mes);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,
                    "Parâmetro 'mes' inválido, use o formato yyyy-MM.");
        }
    }
}
