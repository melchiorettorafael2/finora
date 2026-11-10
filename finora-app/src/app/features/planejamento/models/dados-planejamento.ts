/** Limite mensal de gastos de uma categoria (recorrente) e quanto já foi gasto no mês consultado */
export interface OrcamentoCategoria {
    id: string;
    categoriaId: string;
    categoria: string;
    limite: number;
    gasto: number;
}

/** Objetivo de economia de médio/longo prazo */
export interface MetaEconomia {
    id: string;
    nome: string;
    icone: string;
    objetivo: number;
    acumulado: number;
    prazo: string; // 'yyyy-MM-dd'
}

export interface Planejamento {
    mes: string; // 'yyyy-MM'
    receitasMes: number; // receitas lançadas no mês, para comparar com o orçamento
    orcamentos: OrcamentoCategoria[];
    metas: MetaEconomia[];
}

// ===== Formulários =====

export interface OrcamentoForm {
    categoriaId: string;
    limite: string;
}

export interface MetaEconomiaForm {
    nome: string;
    icone: string;
    objetivo: string;
    acumulado: string;
    prazo: string;
}

/** Ícones disponíveis para as metas (classes do Font Awesome) */
export const ICONES_META: { valor: string; rotulo: string }[] = [
    { valor: 'fa-piggy-bank', rotulo: 'Cofrinho' },
    { valor: 'fa-shield-heart', rotulo: 'Reserva de emergência' },
    { valor: 'fa-plane', rotulo: 'Viagem' },
    { valor: 'fa-house', rotulo: 'Casa' },
    { valor: 'fa-car', rotulo: 'Carro' },
    { valor: 'fa-laptop', rotulo: 'Eletrônicos' },
    { valor: 'fa-graduation-cap', rotulo: 'Estudos' },
    { valor: 'fa-ring', rotulo: 'Casamento' },
    { valor: 'fa-baby', rotulo: 'Filhos' },
    { valor: 'fa-chart-line', rotulo: 'Investimentos' },
];
