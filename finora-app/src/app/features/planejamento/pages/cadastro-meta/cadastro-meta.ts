import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { Header } from '../../../../common/components/header/header';
import { PlanejamentoService } from '../../services/planejamento-service';
import { ICONES_META, MetaEconomiaForm } from '../../models/dados-planejamento';
import { formularioInvalido, tratarErroApi, valorParaApi, valorParaMascara } from '../../../../shared/utils/formulario';

@Component({
  selector: 'app-cadastro-meta',
  imports: [Header, ReactiveFormsModule, NgxMaskDirective, RouterLink, NgClass],
  templateUrl: './cadastro-meta.html',
  styleUrl: './cadastro-meta.scss',
})
export class CadastroMeta implements OnInit {

  private service = inject(PlanejamentoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastrService);

  icones = ICONES_META;
  idMeta: string | null = null;
  salvando = signal(false);

  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    icone: new FormControl(ICONES_META[0].valor, { nonNullable: true, validators: Validators.required }),
    objetivo: new FormControl('', { nonNullable: true, validators: Validators.required }),
    acumulado: new FormControl('0,00', { nonNullable: true }),
    prazo: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    this.idMeta = this.route.snapshot.paramMap.get('id');
    if (!this.idMeta) {
      return;
    }

    this.service.buscarMeta(this.idMeta).subscribe({
      next: meta => this.form.patchValue({
        nome: meta.nome,
        icone: meta.icone,
        objetivo: valorParaMascara(meta.objetivo),
        acumulado: valorParaMascara(meta.acumulado),
        prazo: meta.prazo,
      }),
      error: () => {
        this.toast.error('Meta não encontrada.', 'Erro');
        this.router.navigate(['/paginas/planejamento']);
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
    const requisicao = this.idMeta
      ? this.service.atualizarMeta(this.idMeta, dados)
      : this.service.criarMeta(dados);

    this.salvando.set(true);
    requisicao.subscribe({
      next: () => {
        this.toast.success(this.idMeta ? 'Meta atualizada com sucesso!' : 'Meta cadastrada com sucesso!', 'Sucesso');
        this.router.navigate(['/paginas/planejamento']);
      },
      error: erro => {
        this.salvando.set(false);
        tratarErroApi(erro, this.form, this.toast);
      },
    });
  }
}
