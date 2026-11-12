export class DadosCategoriaForm {
    nome!: string;
    icone!: string;
}

export class DetalhesCategoria {
   id!: string;
   nome!: string;
   icone!: string | null; // categorias antigas vêm sem ícone: usar ICONE_CATEGORIA_PADRAO
   ativo!: boolean;
}
