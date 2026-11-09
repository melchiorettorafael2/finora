import { TipoLancamento } from '../../../lancamentos/dados-lancamentos';

/** Quantidade de meses analisados, contando o mês atual */
export type PeriodoRelatorio = 3 | 6 | 12;

export interface ResumoMensal {
    mes: string; // 'yyyy-MM'
    receitas: number;
    despesas: number;
}

export interface CategoriaRelatorio {
    categoria: string;
    valor: number;
    variacao: number; // % em relação ao período anterior de mesmo tamanho
}

export interface LancamentoRelatorio {
    descricao: string;
    categoria: string;
    data: string; // 'yyyy-MM-dd'
    valor: number;
    tipo: TipoLancamento;
}

export interface Relatorio {
    periodo: PeriodoRelatorio;
    meses: ResumoMensal[];
    categorias: CategoriaRelatorio[];
    maioresLancamentos: LancamentoRelatorio[];
}
