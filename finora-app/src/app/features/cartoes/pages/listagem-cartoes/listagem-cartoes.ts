import { Component, OnInit, inject} from '@angular/core';
import { CartaoService } from '../../services/cartao-service';
import { Observable } from 'rxjs';
import { DetalhesCartao } from '../../models/dados-cartao';
import { PageResult } from '../../../../shared/models/page-result';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listagem-cartoes',
  imports: [CommonModule],
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

  mudarStatus(idCartao: string){
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
