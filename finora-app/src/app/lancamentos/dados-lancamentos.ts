export type TipoLancamento = 'RECEITA' | 'DESPESA';

export class DadosLancamentos {
    categoriaId!: string;
    data!: string;
    valor!: string;
    tipo!: TipoLancamento;
    cartaoId?: string | null; 
}

export class DetalhesLancamento {
    id!: string;
    categoriaId!: string;
    data!: string;
    valor!: string;
    tipo!: TipoLancamento;
    cartaoId?: string | null;
    cartaoNome?: string;
}

export interface FiltroLancamento {
    mes?: string;
    tipo?: TipoLancamento;
    categoriaId?: string;   
    page?: number;
    size?: number;
}   