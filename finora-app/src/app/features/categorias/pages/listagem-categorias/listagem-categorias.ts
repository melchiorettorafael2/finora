import { Component, HostListener, inject, signal } from '@angular/core';
import { CategoriaService } from '../../services/categoria-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { DetalhesCategoria } from '../../models/dados-categoria';
import { ICONE_CATEGORIA_PADRAO } from '../../models/icones-categoria';
import { PageResult } from '../../../../shared/models/page-result';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Header } from '../../../../common/components/header/header';
import { ConfirmDialog } from '../../../../common/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../../../common/components/modal/modal';
import { CadastroCategoria } from '../cadastro-categoria/cadastro-categoria';

@Component({
  selector: 'app-listagem-categorias',
  imports: [CommonModule, Header, ConfirmDialog, Modal, CadastroCategoria],
  templateUrl: './listagem-categorias.html',
  styleUrl: './listagem-categorias.scss',
})
export class ListagemCategorias {

  service = inject(CategoriaService);
  toast = inject(ToastrService);
  paginaAtual = 0;
  tamanhoPagina = 10;
  // Um observable só, recarregado pelo subject: trocar a instância de listagem$ a cada recarga
  // (após excluir/desativar) disparava ExpressionChangedAfterItHasBeenChecked no async pipe
  private recarregar$ = new BehaviorSubject<void>(undefined);
  listagem$ = this.recarregar$.pipe(switchMap(() => this.service.listar(this.paginaAtual, this.tamanhoPagina)));
  readonly iconePadrao = ICONE_CATEGORIA_PADRAO;
  // Signals: o menu também é fechado por eventos globais (clique fora, scroll, Esc)
  menuAberto = signal<string | null>(null);
  menuPosicao = signal({ top: 0, left: 0 });
  categoriaParaExcluir = signal<DetalhesCategoria | null>(null);
  // Modal de cadastro/edição: null = fechado; id null = categoria nova
  modalCategoria = signal<{ id: string | null } | null>(null);

  listarCategorias(){
    this.recarregar$.next();
  }

  navegar(pagina: number){
    this.paginaAtual = pagina;
    this.listarCategorias();
  }

  navegarProximo(listagem: PageResult<DetalhesCategoria>){
    if(!listagem.last){
      this.navegar(listagem.number + 1);
    }
  }

  navegarAnterior(listagem: PageResult<DetalhesCategoria>){
    if(!listagem.first){
      this.navegar(listagem.number - 1);
    }
  }

  paginas(listagem: PageResult<DetalhesCategoria>){
    return Array.from({ length: listagem.totalPages }, (_, i) => i);
  }

  prepararEdicao(idCategoria: string){
    this.fecharMenu();
    this.modalCategoria.set({ id: idCategoria });
  }

  aoSalvarCategoria(){
    this.modalCategoria.set(null);
    this.listarCategorias();
  }

  alternarMenu(event: MouseEvent, idCategoria: string){
    event.stopPropagation();
    if (this.menuAberto() === idCategoria) {
      this.fecharMenu();
      return;
    }
    // O menu usa position: fixed para não ser cortado pelo overflow da tabela
    const botao = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosicao.set({ top: botao.bottom + 4, left: botao.right });
    this.menuAberto.set(idCategoria);
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  @HostListener('window:resize')
  @HostListener('window:wheel')
  fecharMenu(){
    this.menuAberto.set(null);
  }

  excluir(categoria: DetalhesCategoria){
    this.fecharMenu();
    this.categoriaParaExcluir.set(categoria);
  }

  cancelarExclusao(){
    this.categoriaParaExcluir.set(null);
  }

  confirmarExclusao(){
    const categoria = this.categoriaParaExcluir();
    if (!categoria) {
      return;
    }
    const idCategoria = categoria.id;
    this.categoriaParaExcluir.set(null);
    this.service.deletar(idCategoria).subscribe({
      next: () => {
        this.toast.success('Categoria excluída com sucesso!', 'Sucesso');
        this.listarCategorias();
      },
      error: (error) => {
        // 409: categoria com lançamentos (a API explica o motivo)
        if (error.status === 409 && error.error?.message) {
          this.toast.error(error.error.message, 'Não foi possível excluir');
          return;
        }
        this.toast.error('Erro ao excluir categoria!', 'Erro');
        console.error(error);
      }
    });
  }

  mudarStatus(idCategoria: string){
    this.fecharMenu();
    this.service.mudarStatus(idCategoria).subscribe({
      next: () => {
        this.toast.success('Status da categoria alterado com sucesso!', 'Sucesso');
        this.listarCategorias();
      },
      error: (error) => {
        this.toast.error('Erro ao alterar status da categoria!', 'Erro');
        console.error(error);
      }
    });
  }

}
