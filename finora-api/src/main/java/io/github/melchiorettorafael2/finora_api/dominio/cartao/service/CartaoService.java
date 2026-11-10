package io.github.melchiorettorafael2.finora_api.dominio.cartao.service;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.persistence.CartaoRepository;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoForm;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.mapper.CartaoMapper;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CartaoService {

    @Autowired
    private CartaoValidator validator;
    @Autowired
    private CartaoRepository repository;
    @Autowired
    private CartaoMapper mapper;
    @Autowired
    private UsuarioLogado usuarioLogado;


    public CartaoDetalhes criar(CartaoForm form) {
        var result = validator.validar(form, null);

        if (result.isInvalido()) {
            throw new ValidationException(result.getCamposInvalidos());
        }
        CartaoEntity entity = mapper.toEntity(form);
        entity.setUsuario(usuarioLogado.get());
        repository.save(entity);
        return mapper.toDetalhes(entity);
    }

    @Transactional
    public void deletar(UUID id){
        repository.delete(buscarDoUsuario(id));
    }

    public CartaoDetalhes obterDetalhes(UUID id) {
        return mapper.toDetalhes(buscarDoUsuario(id));
    }

    @Transactional
    public void atualizar(UUID id, CartaoForm dadosAtualizacao) {
        var entity = buscarDoUsuario(id);
        var result = validator.validar(dadosAtualizacao, id);

        if(result.isInvalido()){
            throw new ValidationException(result.getCamposInvalidos());
        }

        mapper.update(entity, dadosAtualizacao);
    }

    public Page<CartaoDetalhes> listar(PageRequest pageRequest) {
        return repository.findAllByUsuarioId(usuarioLogado.id(), pageRequest).map(mapper::toDetalhes);
    }

    @Transactional
    public void mudarStatus(UUID id){
        var cartao = buscarDoUsuario(id);
        cartao.setAtivo(!cartao.getAtivo());
    }

    public List<CartaoDetalhes> listarAtivos() {
        return repository.findByAtivoTrueAndUsuarioId(usuarioLogado.id()).stream().map(mapper::toDetalhes).toList();
    }

    // Cartão de outro usuário responde como inexistente (404), sem revelar que ele existe
    private CartaoEntity buscarDoUsuario(UUID id) {
        return repository.findByIdAndUsuarioId(id, usuarioLogado.id()).orElseThrow(RegistroNaoEncontradoException::new);
    }
}
