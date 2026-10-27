import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoLancamento } from '../dados-lancamentos';
import { ToastrService } from 'ngx-toastr';
import {inject} from '@angular/core';
import { LancamentoService } from '../lancamento-service';
import { DetalhesCategoria } from '../../features/categorias/models/dados-categoria';
import { DetalhesCartao } from '../../features/cartoes/models/dados-cartao';
import { forkJoin} from 'rxjs';
import { Header } from '../../common/components/header/header';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';


interface CadastroLancamentoForm{
  categoriaId: FormControl<string>;
  data: FormControl<string>;
  valor: FormControl<string>;
  tipo: FormControl<TipoLancamento | ''>;
  cartaoId: FormControl<string>;
}

@Component({
  selector: 'app-cadastro-lancamento',
  imports: [Header, ReactiveFormsModule, CommonModule, NgxMaskDirective],
  templateUrl: './cadastro-lancamento.html',
  styleUrl: './cadastro-lancamento.scss',
})
export class CadastroLancamento implements OnInit {

  form!: FormGroup<CadastroLancamentoForm>;
  toast = inject(ToastrService);
  service = inject(LancamentoService);

  categoriasAtivas = signal<DetalhesCategoria[]>([]);
  cartoesAtivos = signal<DetalhesCartao[]>([]);

  ngOnInit(): void {
    this.form = new FormGroup<CadastroLancamentoForm>({
      categoriaId: new FormControl<string>('', {nonNullable: true, validators: Validators.required }),
      data: new FormControl<string>('', {nonNullable: true, validators: Validators.required }),
      valor: new FormControl<string>('', {nonNullable: true, validators: Validators.required }),
      tipo: new FormControl<TipoLancamento | ''>('', {nonNullable: true, validators: Validators.required }),
      cartaoId: new FormControl<string>('', {nonNullable: true }),
     });
    this.inicializarDropDowns();
  }


  inicializarDropDowns(){
    forkJoin({
      categorias: this.service.listarCategoriaDisponiveis(),
      cartoes: this.service.listarCartoesDisponiveis()
    }).subscribe({
      next: (resultado) => {
        this.categoriasAtivas.set(resultado.categorias);
        this.cartoesAtivos.set(resultado.cartoes);
      },
      error: () => this.toast.error('Erro ao carregar categorias e cartões.')
    })
  }

  isDespesa() : boolean{
    return this.form.controls.tipo.value === 'DESPESA';
  }

  handleTipoChange() : void {
    if(!this.isDespesa()){
      this.form.controls.cartaoId.setValue('');
      this.form.controls.cartaoId.setErrors(null);
    }
  }

  handleSubmit(){
    console.log(this.form.value)
  }
}
