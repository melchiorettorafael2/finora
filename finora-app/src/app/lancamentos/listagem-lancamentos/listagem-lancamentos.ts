import { Component, OnInit, inject, signal } from '@angular/core';
import{ FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DetalhesLancamento, TipoLancamento } from '../dados-lancamentos';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../common/components/header/header';
import { LancamentoService } from '../lancamento-service';
import { ToastrService } from 'ngx-toastr';
import { PageResult } from '../../shared/models/page-result';
import { Observable } from 'rxjs';
import { DetalhesCategoria } from '../../features/categorias/models/dados-categoria';

interface FiltrosForm{
  mes: FormControl<string>;
  tipo: FormControl<TipoLancamento | ''>;
  categoriaId: FormControl<string>;

}

@Component({
  selector: 'app-listagem-lancamentos',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './listagem-lancamentos.html',
  styleUrl: './listagem-lancamentos.scss',
})
export class ListagemLancamentos implements OnInit {
  service = inject(LancamentoService);
  router = inject(Router);
  toast = inject(ToastrService);

  listagem$!: Observable<PageResult<DetalhesLancamento>>
  categorias = signal<DetalhesCategoria[]>([]);
  paginaAtual = 0;
  tamanhoPagina = 10;

  form!: FormGroup<FiltrosForm>;

  ngOnInit(): void{
    this.form = new FormGroup<FiltrosForm>({
      mes: new FormControl<string>('', { nonNullable: true }),
      tipo: new FormControl<TipoLancamento | ''>('', { nonNullable: true }),
      categoriaId: new FormControl<string>('', {nonNullable: true}),
    });

    this.service.listarCategoriaDisponiveis()
    .subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: (error) => {
        this.toast.error('Erro ao carregar categorias!', 'Erro');
        console.error(error);
      }
    });

    this.listarLancamentos();
  }

  listarLancamentos(){
    const { mes, tipo, categoriaId } = this.form.getRawValue();

    this.listagem$ = this.service.listar({
      page: this.paginaAtual,
      size: this.tamanhoPagina,
      mes: mes || undefined,
      tipo: tipo || undefined,
      categoriaId: categoriaId || undefined
    });
  }

  aplicarFiltros(){
    this.paginaAtual = 0;
    this.listarLancamentos();
  }

  limparFiltros(){
    this.form.reset();
    this.aplicarFiltros();
  }

  nomeCategoria(categoriaId: string){
    return this.categorias().find(c => c.id === categoriaId)?.nome ?? '-';
  }

  navegar(pagina: number){
    this.paginaAtual = pagina;
    this.listarLancamentos();
  }

  navegarProximo(listagem: PageResult<DetalhesLancamento>){
    if(!listagem.last){
      this.navegar(listagem.number + 1);
    }
  }

  navegarAnterior(listagem: PageResult<DetalhesLancamento>){
    if(!listagem.first){
      this.navegar(listagem.number - 1);
    }
  }

  paginas(listagem: PageResult<DetalhesLancamento>){
    return Array.from({ length: listagem.totalPages }, (_, i) => i);
  }

}
