import { Component, HostListener, inject, signal} from '@angular/core';
import { CartaoService } from '../../services/cartao-service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { DetalhesCartao } from '../../models/dados-cartao';
import { PageResult } from '../../../../shared/models/page-result';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../../../common/components/header/header';
import { ConfirmDialog } from '../../../../common/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../../../common/components/modal/modal';
import { CadastroCartao } from '../cadastro-cartao/cadastro-cartao';

@Component({
  selector: 'app-listagem-cartoes',
  imports: [CommonModule, Header, ConfirmDialog, Modal, CadastroCartao],
  templateUrl: './listagem-cartoes.html',
  styleUrl: './listagem-cartoes.scss',
})
export class ListagemCartoes {

  service = inject(CartaoService);
  router = inject(Router);
  toast = inject(ToastrService);
  paginaAtual = 0;
  tamanhoPagina = 10;
  // Um observable só, recarregado pelo subject: trocar a instância de listagem$ a cada recarga
  // (após excluir/desativar) disparava ExpressionChangedAfterItHasBeenChecked no async pipe
  private recarregar$ = new BehaviorSubject<void>(undefined);
  listagem$ = this.recarregar$.pipe(switchMap(() => this.service.listar(this.paginaAtual, this.tamanhoPagina)));
  menuAberto: string | null = null;
  menuPosicao = { top: 0, left: 0 };
  cartaoParaExcluir: DetalhesCartao | null = null;
  // Modal de cadastro/edição: null = fechado; id null = cartão novo
  modalCartao = signal<{ id: string | null } | null>(null);

  listarCartoes(){
    this.recarregar$.next();
  }

  navegar(pagina: number){  
    this.paginaAtual = pagina;
    this.listarCartoes();
  } 

  navegarProximo(listagem: PageResult<DetalhesCartao>){
    if(!listagem.last){
      this.navegar(listagem.number + 1);
    }
  }

  navegarAnterior(listagem: PageResult<DetalhesCartao>){
    if(!listagem.first){
      this.navegar(listagem.number - 1);
    }
  }

  paginas(listagem: PageResult<DetalhesCartao>){
    return Array.from({ length: listagem.totalPages }, (_, i) => i);
  }

  prepararEdicao(idCartao: string){
    this.modalCartao.set({ id: idCartao });
  }

  aoSalvarCartao(){
    this.modalCartao.set(null);
    this.listarCartoes();
  }

  alternarMenu(event: MouseEvent, idCartao: string){
    event.stopPropagation();
    if (this.menuAberto === idCartao) {
      this.fecharMenu();
      return;
    }
    // O menu usa position: fixed para não ser cortado pelo overflow da tabela
    const botao = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosicao = { top: botao.bottom + 4, left: botao.right };
    this.menuAberto = idCartao;
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  @HostListener('window:resize')
  @HostListener('window:wheel')
  fecharMenu(){
    this.menuAberto = null;
  }

  excluir(cartao: DetalhesCartao){
    this.fecharMenu();
    this.cartaoParaExcluir = cartao;
  }

  cancelarExclusao(){
    this.cartaoParaExcluir = null;
  }

  confirmarExclusao(){
    if (!this.cartaoParaExcluir) {
      return;
    }
    const idCartao = this.cartaoParaExcluir.id;
    this.cartaoParaExcluir = null;
    this.service.deletar(idCartao)
    .subscribe({
      next: () => {
        this.toast.success('Cartão excluído.', 'Sucesso');
        this.listarCartoes();
      },
      error: (error) => {
        this.toast.error('Não foi possível excluir o cartão.', 'Erro');
        console.error(error);
      }
    });
  }

  mudarStatus(idCartao: string){
    this.fecharMenu();
    console.log('Preparando mudança de status do cartão com ID:', idCartao);
    this.service.mudarStatus(idCartao) 
    .subscribe({
      next: () => {
        this.toast.success('Status do cartão alterado.', 'Sucesso');
        this.listarCartoes();
      },
      error: (error) => {
        this.toast.error('Não foi possível alterar o status.', 'Erro');
        console.error(error);
      }
    });
  } 

}
