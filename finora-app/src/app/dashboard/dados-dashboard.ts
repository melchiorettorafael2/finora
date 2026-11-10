import { DetalhesLancamento } from '../lancamentos/dados-lancamentos';
import { ResumoMensal } from '../features/relatorios/models/dados-relatorio';

export class ResumoFinanceiro {
    receitas!: number;
    despesas!: number;
    saldo!: number;
}

export class DespesaCategoriaResumo {
    categoria!: string;
    valor!: number;
}

/** Soma dos orçamentos do Planejamento no mês */
export interface ResumoOrcamento {
    limite: number;
    gasto: number;
    categoriasAcimaDoLimite: number;
}

export class Dashboard {
    mes!: string;
    resumo!: ResumoFinanceiro;
    resumoMesAnterior!: ResumoFinanceiro;
    despesasPorCategoria!: DespesaCategoriaResumo[];
    orcamento!: ResumoOrcamento | null; // null quando não há orçamento definido
    evolucao!: ResumoMensal[]; // últimos 6 meses, terminando no mês consultado
    ultimosLancamentos!: DetalhesLancamento[];
}
