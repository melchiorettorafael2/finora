import { Component, OnInit, inject} from '@angular/core';
import { CategoriaService } from '../../services/categoria-service';
import { Observable } from 'rxjs';
import { DetalhesCategoria } from '../../models/dados-categoria';
import { PageResult } from '../../../../shared/models/page-result';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../../../common/components/header/header';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-listagem-categorias',
  imports: [CommonModule, Header, RouterLink],
  templateUrl: './listagem-categorias.html',
  styleUrl: './listagem-categorias.scss',
})
export class ListagemCategorias implements OnInit {

  service = inject(CategoriaService);
  router = inject(Router);
  toast = inject(ToastrService);
  listagem$!: Observable<PageResult<DetalhesCategoria>>; 
  paginaAtual = 0;
  tamanhoPagina = 10;

  ngOnInit(): void {
    this.listarCategorias();
  }
  
  listarCategorias(){
    this.listagem$ = this.service.listar(this.paginaAtual, this.tamanhoPagina);
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


  mudarStatus(idCategoria: string){
    console.log('Preparando mudança de status da categoria com ID:', idCategoria);
    this.service.mudarStatus(idCategoria) 
    .subscribe({
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
