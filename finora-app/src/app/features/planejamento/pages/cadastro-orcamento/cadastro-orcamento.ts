import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { Header } from '../../../../common/components/header/header';
import { DetalhesCategoria } from '../../../categorias/models/dados-categoria';
import { PlanejamentoService } from '../../services/planejamento-service';
import { formularioInvalido, tratarErroApi, valorParaApi, valorParaMascara } from '../../../../shared/utils/formulario';

@Component({
  selector: 'app-cadastro-orcamento',
  imports: [Header, ReactiveFormsModule, NgxMaskDirective, RouterLink],
  templateUrl: './cadastro-orcamento.html',
})
export class CadastroOrcamento implements OnInit {

  private service = inject(PlanejamentoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastrService);

  categorias = signal<DetalhesCategoria[]>([]);
  editando = false;
  salvando = signal(false);

  form = new FormGroup({
    categoriaId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    limite: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    // Vindo do botão "Alterar limite": categoria e limite atuais chegam pela URL
    const params = this.route.snapshot.queryParamMap;
    const categoriaId = params.get('categoriaId');
    if (categoriaId) {
      this.editando = true;
      this.form.patchValue({ categoriaId, limite: valorParaMascara(Number(params.get('limite'))) });
    }

    this.service.listarCategoriasDisponiveis().subscribe({
      next: categorias => this.categorias.set(categorias),
      error: () => this.toast.error('Erro ao carregar as categorias.', 'Erro'),
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
        this.toast.success('Orçamento salvo com sucesso!', 'Sucesso');
        this.router.navigate(['/paginas/planejamento']);
      },
      error: erro => {
        this.salvando.set(false);
        tratarErroApi(erro, this.form, this.toast);
      },
    });
  }
}
