package io.github.melchiorettorafael2.finora_api.infra.demo;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.BandeiraCartao;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.LancamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.MetaEconomiaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.OrcamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

/**
 * Mantém a conta de demonstração sempre "como nova": ao subir a API e todo dia às 4h (Brasília),
 * apaga o que os visitantes criaram e recria 12 meses de dados realistas até a data de hoje.
 * Só roda com DEMO_LOGIN e DEMO_SENHA definidos (em produção, no .env do servidor).
 */
@Service
public class DemoService {

    private static final Logger log = LoggerFactory.getLogger(DemoService.class);
    private static final ZoneId BRASILIA = ZoneId.of("America/Sao_Paulo");

    private final ContaDemo contaDemo;
    private final String senha;
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder encoder;
    private final EntityManager em;

    // Estado de uma restauração (a classe é singleton, mas restaurar() é synchronized)
    private UsuarioEntity usuario;
    private Random random;
    private int lancamentos;

    public DemoService(ContaDemo contaDemo,
                       @Value("${app.demo.senha:}") String senha,
                       UsuarioRepository usuarioRepository,
                       BCryptPasswordEncoder encoder,
                       EntityManager em) {
        this.contaDemo = contaDemo;
        this.senha = senha == null ? "" : senha;
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.em = em;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 4 * * *", zone = "America/Sao_Paulo")
    @Transactional
    public synchronized void restaurar() {
        if (!contaDemo.ativa() || senha.isBlank()) {
            return;
        }
        usuario = usuarioRepository.findByLogin(contaDemo.getLogin()).orElseGet(UsuarioEntity::new);
        usuario.setLogin(contaDemo.getLogin());
        usuario.setNome("Conta Demo");
        usuario.setSenha(encoder.encode(senha));
        usuario.setDoisFatoresAtivo(false);
        usuario.setTotpSegredo(null);
        usuario.setTotpSegredoPendente(null);
        usuario.setTotpUltimoPasso(null);
        usuarioRepository.save(usuario);

        apagarDados();
        random = new Random(20261113); // mesma "aleatoriedade" a cada restauração
        lancamentos = 0;
        criarDados(LocalDate.now(BRASILIA));
        log.info("Conta demo restaurada ({}): {} lançamentos", contaDemo.getLogin(), lancamentos);
    }

    // Ordem importa por causa das chaves estrangeiras: lançamentos e orçamentos antes de categorias e cartões
    private void apagarDados() {
        for (String entidade : new String[]{"LancamentoEntity", "OrcamentoEntity", "MetaEconomiaEntity", "CategoriaEntity", "CartaoEntity"}) {
            em.createQuery("delete from " + entidade + " e where e.usuario = :u").setParameter("u", usuario).executeUpdate();
        }
        em.createQuery("delete from FotoUsuarioEntity f where f.usuarioId = :id").setParameter("id", usuario.getId()).executeUpdate();
    }

    private void criarDados(LocalDate hoje) {
        CartaoEntity nubank = cartao("Nubank", BandeiraCartao.MASTERCARD);
        CartaoEntity inter = cartao("Inter Gold", BandeiraCartao.VISA);
        cartao("C6 Carbon", BandeiraCartao.MASTERCARD);

        Map<String, CategoriaEntity> cat = new LinkedHashMap<>();
        String[][] categorias = {
                {"Salário", "fa-sack-dollar"}, {"Freelance", "fa-briefcase"}, {"Investimentos", "fa-chart-line"},
                {"Moradia", "fa-house"}, {"Alimentação", "fa-utensils"}, {"Mercado", "fa-cart-shopping"},
                {"Transporte", "fa-car"}, {"Contas", "fa-receipt"}, {"Internet e celular", "fa-wifi"},
                {"Lazer", "fa-film"}, {"Saúde", "fa-heart-pulse"}, {"Educação", "fa-graduation-cap"},
                {"Academia", "fa-dumbbell"}, {"Roupas", "fa-shirt"}, {"Pets", "fa-paw"}, {"Viagem", "fa-plane"}};
        for (String[] c : categorias) {
            cat.put(c[0], categoria(c[0], c[1]));
        }

        for (int k = 11; k >= 0; k--) {
            YearMonth mes = YearMonth.from(hoje).minusMonths(k);
            int ate = k == 0 ? hoje.getDayOfMonth() : 28; // mês atual só até hoje
            int m = mes.getMonthValue();

            // Receitas
            receita(mes, ate, 5, cat.get("Salário"), 5200, 0, "Salário");
            if (k % 3 == 1) receita(mes, ate, 18, cat.get("Freelance"), 1400, 600, "Projeto freelance: landing page");
            if (k % 4 == 2) receita(mes, ate, 22, cat.get("Investimentos"), 180, 60, "Rendimento CDB");
            if (m == 12) receita(mes, ate, 20, cat.get("Salário"), 2600, 0, "13º salário");

            // Despesas fixas
            despesa(mes, ate, 6, cat.get("Moradia"), 1450, 0, "Aluguel", null);
            despesa(mes, ate, 10, cat.get("Moradia"), 380, 0, "Condomínio", null);
            despesa(mes, ate, 12, cat.get("Contas"), 165, 50, "Conta de luz", null);
            despesa(mes, ate, 12, cat.get("Contas"), 70, 20, "Conta de água", null);
            despesa(mes, ate, 8, cat.get("Internet e celular"), 119.9, 0, "Internet fibra", nubank);
            despesa(mes, ate, 8, cat.get("Internet e celular"), 59.9, 0, "Plano de celular", nubank);
            despesa(mes, ate, 3, cat.get("Academia"), 119.9, 0, "Mensalidade da academia", inter);
            despesa(mes, ate, 7, cat.get("Educação"), 89.9, 0, "Curso online de inglês", nubank);
            despesa(mes, ate, 15, cat.get("Lazer"), 55.9, 0, "Streaming (Netflix + Spotify)", nubank);

            // Despesas variáveis
            despesa(mes, ate, 4, cat.get("Mercado"), 420, 120, "Compra do mês no mercado", nubank);
            despesa(mes, ate, 19, cat.get("Mercado"), 260, 100, "Feira e hortifruti", null);
            despesa(mes, ate, 9, cat.get("Alimentação"), 85, 40, "Almoço com amigos", inter);
            despesa(mes, ate, 23, cat.get("Alimentação"), 120, 60, "Delivery de pizza", nubank);
            despesa(mes, ate, 2, cat.get("Transporte"), 210, 60, "Combustível", inter);
            despesa(mes, ate, 17, cat.get("Transporte"), 90, 50, "Uber", nubank);
            despesa(mes, ate, 26, cat.get("Lazer"), 180, 140, k % 2 == 1 ? "Cinema e jantar" : "Show", nubank);
            despesa(mes, ate, 11, cat.get("Pets"), 140, 50, "Ração e petshop", inter);
            if (k % 2 == 0) despesa(mes, ate, 14, cat.get("Saúde"), 110, 60, "Farmácia", null);
            if (k % 5 == 3) despesa(mes, ate, 21, cat.get("Saúde"), 250, 0, "Consulta médica", null);
            if (k % 3 == 0) despesa(mes, ate, 24, cat.get("Roupas"), 260, 160, "Roupas e calçados", nubank);
            if (m == 7) despesa(mes, ate, 10, cat.get("Viagem"), 1850, 0, "Viagem de férias: passagens e hotel", inter);
        }

        orcamento(cat.get("Mercado"), 750);
        orcamento(cat.get("Alimentação"), 300);
        orcamento(cat.get("Transporte"), 350);
        orcamento(cat.get("Lazer"), 400);
        orcamento(cat.get("Saúde"), 250);
        orcamento(cat.get("Roupas"), 200);

        int ano = hoje.getYear() + 1;
        meta("Viagem para o Chile", "fa-plane", 8000, 3450, LocalDate.of(ano, 7, 30));
        meta("Reserva de emergência", "fa-shield-heart", 18000, 11200, LocalDate.of(ano, 12, 31));
        meta("Notebook novo", "fa-laptop", 6500, 2100, LocalDate.of(ano, 4, 30));
    }

    // ===== criação das entidades =====

    private CartaoEntity cartao(String nome, BandeiraCartao bandeira) {
        CartaoEntity c = new CartaoEntity();
        c.setNome(nome);
        c.setBandeira(bandeira);
        c.setAtivo(true);
        c.setUsuario(usuario);
        em.persist(c);
        return c;
    }

    private CategoriaEntity categoria(String nome, String icone) {
        CategoriaEntity c = new CategoriaEntity();
        c.setNome(nome);
        c.setIcone(icone);
        c.setAtivo(true);
        c.setUsuario(usuario);
        em.persist(c);
        return c;
    }

    private void receita(YearMonth mes, int ate, int dia, CategoriaEntity c, double base, double varia, String descricao) {
        lancamento(TipoLancamento.RECEITA, mes, ate, dia, c, base, varia, descricao, null);
    }

    private void despesa(YearMonth mes, int ate, int dia, CategoriaEntity c, double base, double varia, String descricao, CartaoEntity cartao) {
        lancamento(TipoLancamento.DESPESA, mes, ate, dia, c, base, varia, descricao, cartao);
    }

    private void lancamento(TipoLancamento tipo, YearMonth mes, int ate, int dia, CategoriaEntity c,
                            double base, double varia, String descricao, CartaoEntity cartao) {
        double valor = base + (random.nextDouble() - 0.5) * varia; // sorteia sempre, para a sequência não mudar
        if (dia > ate) {
            return; // dia ainda não chegou no mês atual
        }
        LancamentoEntity l = new LancamentoEntity();
        l.setTipo(tipo);
        l.setCategoria(c);
        l.setData(mes.atDay(dia));
        l.setValor(BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP));
        l.setDescricao(descricao);
        l.setCartao(cartao);
        l.setUsuario(usuario);
        em.persist(l);
        lancamentos++;
    }

    private void orcamento(CategoriaEntity c, double limite) {
        OrcamentoEntity o = new OrcamentoEntity();
        o.setCategoria(c);
        o.setLimite(BigDecimal.valueOf(limite));
        o.setUsuario(usuario);
        em.persist(o);
    }

    private void meta(String nome, String icone, double objetivo, double acumulado, LocalDate prazo) {
        MetaEconomiaEntity m = new MetaEconomiaEntity();
        m.setNome(nome);
        m.setIcone(icone);
        m.setObjetivo(BigDecimal.valueOf(objetivo));
        m.setAcumulado(BigDecimal.valueOf(acumulado));
        m.setPrazo(prazo);
        m.setUsuario(usuario);
        em.persist(m);
    }
}
