import { Component, HostListener, OnInit, inject} from '@angular/core';
import { CartaoService } from '../../services/cartao-service';
import { Observable } from 'rxjs';
import { DetalhesCartao } from '../../models/dados-cartao';
import { PageResult } from '../../../../shared/models/page-result';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../../../common/components/header/header';
import { ConfirmDialog } from '../../../../common/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-listagem-cartoes',
  imports: [CommonModule, Header, ConfirmDialog],
  templateUrl: './listagem-cartoes.html',
  styleUrl: './listagem-cartoes.scss',
})
export class ListagemCartoes implements OnInit {

  service = inject(CartaoService);
  router = inject(Router);
  toast = inject(ToastrService);
  listagem$!: Observable<PageResult<DetalhesCartao>>; 
  paginaAtual = 0;
  tamanhoPagina = 10;
  menuAberto: string | null = null;
  menuPosicao = { top: 0, left: 0 };
  cartaoParaExcluir: DetalhesCartao | null = null;

  ngOnInit(): void {
    this.listarCartoes();
  }
  
  listarCartoes(){
    this.listagem$ = this.service.listar(this.paginaAtual, this.tamanhoPagina);
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
    console.log('Preparando edição do cartão com ID:', idCartao); 
    this.router.navigate(['/paginas/cadastro-cartoes'],{ 
      queryParams:{
        id: idCartao
      }
  });
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
        this.toast.success('Cartão excluído com sucesso!', 'Sucesso');
        this.listarCartoes();
      },
      error: (error) => {
        this.toast.error('Erro ao excluir cartão!', 'Erro');
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
        this.toast.success('Status do cartão alterado com sucesso!', 'Sucesso');
        this.listarCartoes();
      },
      error: (error) => {
        this.toast.error('Erro ao alterar status do cartão!', 'Erro');
        console.error(error);
      }
    });
  } 

}
