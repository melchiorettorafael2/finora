package io.github.melchiorettorafael2.finora_api.dominio.categoria.service;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.RegraNegocioException;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository.LancamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository.OrcamentoRepository;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.repository.CategoriaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaForm;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.mapper.CategoriaMapper;
import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;
import jakarta.transaction.Transactional;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaValidator validator;

    @Autowired
    private CategoriaMapper mapper;

    @Autowired
    private CategoriaRepository repository;

    @Autowired
    private UsuarioLogado usuarioLogado;

    @Autowired
    private LancamentoRepository lancamentoRepository;

    @Autowired
    private OrcamentoRepository orcamentoRepository;


    public CategoriaDetalhes criar(CategoriaForm nova) {
        ValidationResult result = validator.validar(nova);

        if(result.isInvalido()){
            throw new ValidationException(result.getCamposInvalidos());
        }

        CategoriaEntity entity = mapper.toEntity(nova);
        entity.setUsuario(usuarioLogado.get());
        repository.save(entity);

        return mapper.toDetalhes(entity);
    }

    public CategoriaDetalhes obterDetalhes(UUID id) {
        return mapper.toDetalhes(buscarDoUsuario(id));
    }

    @Transactional
    public void atualizar(UUID id, CategoriaForm dados) {
        var entity = buscarDoUsuario(id);
        ValidationResult result = validator.validar(dados, id);

        if(result.isInvalido()){
            throw new ValidationException(result.getCamposInvalidos());
        }

        mapper.update(entity, dados);
    }

    @Transactional
    public void deletar(UUID id) {
        var categoria = buscarDoUsuario(id);

        // Com lançamentos, excluir apagaria o histórico: a saída é desativar
        if (lancamentoRepository.existsByCategoriaIdAndUsuarioId(id, usuarioLogado.id())) {
            throw new RegraNegocioException("Esta categoria tem lançamentos. Desative-a para escondê-la sem perder o histórico.");
        }

        // O orçamento da categoria (se houver) deixa de fazer sentido e sai junto
        orcamentoRepository.findByCategoriaIdAndUsuarioId(id, usuarioLogado.id()).ifPresent(orcamentoRepository::delete);
        repository.delete(categoria);
    }

    public Page<CategoriaDetalhes> listar(PageRequest pageRequest) {
        return repository
                .findAllByUsuarioId(usuarioLogado.id(), pageRequest)
                .map(mapper::toDetalhes);
    }

    @Transactional
    public void mudarStatus(UUID id) {
        var categoria = buscarDoUsuario(id);

        categoria.setAtivo(!categoria.getAtivo());
        repository.save(categoria);
    }

    public List<CategoriaDetalhes> listarAtivas() {
        return repository.findByAtivoTrueAndUsuarioId(usuarioLogado.id()).stream().map(mapper::toDetalhes).toList();
    }

    // Categoria de outro usuário responde como inexistente (404)
    private CategoriaEntity buscarDoUsuario(UUID id) {
        return repository.findByIdAndUsuarioId(id, usuarioLogado.id()).orElseThrow(RegistroNaoEncontradoException::new);
    }
}
