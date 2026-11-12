import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { DetalhesCategoria } from '../../../categorias/models/dados-categoria';
import { PlanejamentoService } from '../../services/planejamento-service';
import { formularioInvalido, tratarErroApi, valorParaApi, valorParaMascara } from '../../../../shared/utils/formulario';

/** Formulário de orçamento (limite mensal por categoria), aberto em modal pelo Planejamento. */
@Component({
  selector: 'app-cadastro-orcamento',
  imports: [ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './cadastro-orcamento.html',
})
export class CadastroOrcamento implements OnInit {

  /** Ao alterar um limite existente: categoria e limite atuais. Vazios para um orçamento novo. */
  categoriaId = input<string | null>(null);
  limite = input<number | null>(null);
  salvo = output<void>();
  cancelado = output<void>();

  private service = inject(PlanejamentoService);
  private toast = inject(ToastrService);

  categorias = signal<DetalhesCategoria[]>([]);
  salvando = signal(false);

  form = new FormGroup({
    categoriaId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    limite: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  get editando(): boolean {
    return !!this.categoriaId();
  }

  ngOnInit(): void {
    const categoriaId = this.categoriaId();
    if (categoriaId) {
      this.form.patchValue({ categoriaId, limite: valorParaMascara(this.limite()) });
    }

    this.service.listarCategoriasDisponiveis().subscribe({
      next: categorias => this.categorias.set(categorias),
      error: () => this.toast.error('Não foi possível carregar as categorias.', 'Erro'),
    });
  }

  salvar() {
    if (formularioInvalido(this.form, this.toast)) {
      return;
    }

    const dados = this.form.getRawValue();
    this.salvando.set(true);
    this.service.definirOrcamento({ ...dados, limite: valorParaApi(dados.limite) }).subscribe({
      next: () => {
        this.toast.success(this.editando ? 'Orçamento atualizado.' : 'Orçamento definido.', 'Sucesso');
        this.salvo.emit();
      },
      error: erro => {
        this.salvando.set(false);
        tratarErroApi(erro, this.form, this.toast);
      },
    });
  }
}
