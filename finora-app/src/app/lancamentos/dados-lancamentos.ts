export type TipoLancamento = 'RECEITA' | 'DESPESA';

export class DadosLancamentoForm {
    categoriaId!: string;
    data!: string;
    valor!: string;
    tipo!: TipoLancamento;
    cartaoId?: string | null; 
}

export class DetalhesLancamento {
    id!: string;
    descricao!: string;
    categoriaId!: string;
    categoriaNome!: string;
    data!: string;
    valor!: string;
    tipo!: TipoLancamento;
    cartaoId?: string | null;
    cartaoNome?: string;
}

export class DadosLancamentos {
    id!: string;
    tipo!: TipoLancamento;
    data!: string;
    valor!: string;
    cartaoId?: string | null; 
}

export interface FiltroLancamento {
    mes?: string;
    tipo?: TipoLancamento;
    categoriaId?: string;   
    page?: number;
    size?: number;
}   