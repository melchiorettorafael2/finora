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
}

export interface Relatorio {
    periodo: PeriodoRelatorio;
    meses: ResumoMensal[];
    categorias: CategoriaRelatorio[];
}
