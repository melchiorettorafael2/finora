package io.github.melchiorettorafael2.finora_api.dominio.planejamento.service;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.repository.CategoriaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.OrcamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository.OrcamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.OrcamentoForm;
import jakarta.transaction.Transactional;
import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OrcamentoService {

    @Autowired
    private OrcamentoRepository repository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private PlanejamentoValidator validator;
    @Autowired
    private UsuarioLogado usuarioLogado;

    /** Cria o limite da categoria ou atualiza o existente (uma categoria tem um único orçamento). */
    @Transactional
    public void definir(OrcamentoForm form) {
        var usuario = usuarioLogado.get();
        // Categoria de outro usuário cai em "Categoria não encontrada."
        var categoria = categoriaRepository.findByIdAndUsuarioId(form.categoriaId(), usuario.getId()).orElse(null);

        var result = validator.validarCategoria(categoria);
        if (result.isInvalido()) {
            throw new ValidationException(result.getCamposInvalidos());
        }

        var orcamento = repository.findByCategoriaIdAndUsuarioId(form.categoriaId(), usuario.getId()).orElseGet(OrcamentoEntity::new);
        orcamento.setUsuario(usuario);
        orcamento.setCategoria(categoria);
        orcamento.setLimite(form.limite());
        repository.save(orcamento);
    }

    public void remover(UUID id) {
        var orcamento = repository.findByIdAndUsuarioId(id, usuarioLogado.id()).orElseThrow(RegistroNaoEncontradoException::new);
        repository.delete(orcamento);
    }
}
