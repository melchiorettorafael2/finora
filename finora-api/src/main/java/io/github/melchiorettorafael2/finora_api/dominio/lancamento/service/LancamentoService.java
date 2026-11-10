package io.github.melchiorettorafael2.finora_api.dominio.lancamento.service;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.persistence.CartaoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.repository.CategoriaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.LancamentoSpecs;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.LancamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository.LancamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoForm;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.mapper.LancamentoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.UUID;

import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;

import static io.github.melchiorettorafael2.finora_api.dominio.lancamento.LancamentoSpecs.*;

@Service
public class LancamentoService {

    @Autowired
    private LancamentoRepository repository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private CartaoRepository cartaoRepository;
    @Autowired
    private LancamentoValidator validator;
    @Autowired
    private LancamentoMapper mapper;
    @Autowired
    private UsuarioLogado usuarioLogado;

    public LancamentoDetalhes criar(LancamentoForm form){
        UUID usuarioId = usuarioLogado.id();
        // Só aceita categoria e cartão do próprio usuário: os de outro usuário caem em "não encontrado"
        CategoriaEntity categoria = categoriaRepository.findByIdAndUsuarioId(form.categoriaId(), usuarioId).orElse(null);

        CartaoEntity cartao = null;
        if(form.cartaoId() != null){
            cartao = cartaoRepository.findByIdAndUsuarioId(form.cartaoId(), usuarioId).orElse(null);
        }

         var result = validator.validar(form, categoria, cartao);

        if(result.isInvalido()){
            throw new ValidationException(result.getCamposInvalidos());
        }

        LancamentoEntity entity = mapper.toEntity(form, categoria, cartao);
        entity.setUsuario(usuarioLogado.get());
        repository.save(entity);

        return mapper.toDetalhes(entity);

    }

    public Page<LancamentoDetalhes> listar(PageRequest pageRequest, YearMonth mes, TipoLancamento tipo, UUID categoriaId){

        Specification<LancamentoEntity> spec = usuarioEqual(usuarioLogado.id());

        if(tipo != null){
            spec = spec.and(tipoEqual(tipo));
        }

        if(categoriaId != null){
            spec = spec.and(categoriaEqual(categoriaId));
        }

        if(mes != null){
            spec = spec.and(mesEqual(mes));
        }

        var resultado = repository.findAll(spec, pageRequest);

        return  resultado.map(mapper::toDetalhes);
    }

    public void deletar(UUID id){
        var lancamento = repository.findByIdAndUsuarioId(id, usuarioLogado.id()).orElseThrow(RegistroNaoEncontradoException::new);
        repository.delete(lancamento);
    }

}
