import { TipoLancamento } from '../../../lancamentos/dados-lancamentos';

/** Limite de gastos definido para uma categoria no mês */
export interface OrcamentoCategoria {
    categoria: string;
    limite: number;
    gasto: number;
}

/** Objetivo de economia de médio/longo prazo */
export interface MetaEconomia {
    nome: string;
    icone: string;
    objetivo: number;
    acumulado: number;
    prazo: string; // 'yyyy-MM-dd'
}

/** Lançamento recorrente esperado para o mês (contas fixas, salário...) */
export interface ContaPrevista {
    descricao: string;
    categoria: string;
    vencimento: string; // 'yyyy-MM-dd'
    valor: number;
    tipo: TipoLancamento;
    pago: boolean;
}

export interface Planejamento {
    mes: string; // 'yyyy-MM'
    receitaPrevista: number;
    orcamentos: OrcamentoCategoria[];
    metas: MetaEconomia[];
    contasPrevistas: ContaPrevista[];
}
