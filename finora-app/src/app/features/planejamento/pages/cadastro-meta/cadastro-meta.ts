import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { PlanejamentoService } from '../../services/planejamento-service';
import { ICONES_META, MetaEconomiaForm } from '../../models/dados-planejamento';
import { formularioInvalido, tratarErroApi, valorParaApi, valorParaMascara } from '../../../../shared/utils/formulario';

/** Formulário de meta de economia, aberto em modal pelo Planejamento (nova e edição). */
@Component({
  selector: 'app-cadastro-meta',
  imports: [ReactiveFormsModule, NgxMaskDirective, NgClass],
  templateUrl: './cadastro-meta.html',
  styleUrl: './cadastro-meta.scss',
})
export class CadastroMeta implements OnInit {

  /** Id da meta a editar; vazio para uma meta nova */
  idMeta = input<string | null>(null);
  salvo = output<void>();
  cancelado = output<void>();

  private service = inject(PlanejamentoService);
  private toast = inject(ToastrService);

  icones = ICONES_META;
  salvando = signal(false);

  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    icone: new FormControl(ICONES_META[0].valor, { nonNullable: true, validators: Validators.required }),
    objetivo: new FormControl('', { nonNullable: true, validators: Validators.required }),
    acumulado: new FormControl('0,00', { nonNullable: true }),
    prazo: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    const id = this.idMeta();
    if (!id) {
      return;
    }

    this.service.buscarMeta(id).subscribe({
      next: meta => this.form.patchValue({
        nome: meta.nome,
        icone: meta.icone,
        objetivo: valorParaMascara(meta.objetivo),
        acumulado: valorParaMascara(meta.acumulado),
        prazo: meta.prazo,
      }),
      error: () => {
        this.toast.error('Meta não encontrada.', 'Erro');
        this.cancelado.emit();
      },
    });
  }

  salvar() {
    if (formularioInvalido(this.form, this.toast)) {
      return;
    }

    const valores = this.form.getRawValue();
    const dados: MetaEconomiaForm = {
      ...valores,
      objetivo: valorParaApi(valores.objetivo),
      acumulado: valorParaApi(valores.acumulado) || '0',
    };
    const id = this.idMeta();
    const requisicao = id
      ? this.service.atualizarMeta(id, dados)
      : this.service.criarMeta(dados);

    this.salvando.set(true);
    requisicao.subscribe({
      next: () => {
        this.toast.success(id ? 'Meta atualizada com sucesso!' : 'Meta cadastrada com sucesso!', 'Sucesso');
        this.salvo.emit();
      },
      error: erro => {
        this.salvando.set(false);
        tratarErroApi(erro, this.form, this.toast);
      },
    });
  }
}
