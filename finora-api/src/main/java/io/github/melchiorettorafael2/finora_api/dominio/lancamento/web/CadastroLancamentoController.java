package io.github.melchiorettorafael2.finora_api.dominio.lancamento.web;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.service.CartaoService;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.service.CategoriaService;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.service.LancamentoService;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoForm;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("lancamentos")
public class CadastroLancamentoController {

    @Autowired
    private LancamentoService service;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private CartaoService cartaoService;



    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LancamentoDetalhes criar(@RequestBody @Valid LancamentoForm form){
        return service.criar(form);
    }

    @GetMapping("categorias-disponiveis")
    public List<CategoriaDetalhes> listarCategoriasDisponiveis(){
        return categoriaService.listarAtivas();
    }

    @GetMapping("cartoes-disponiveis")
    public List<CartaoDetalhes> listarCartoesDisponiveis(){
        return cartaoService.listarAtivos();
    }


}
