import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard-service';
import { Observable } from 'rxjs';
import { Dashboard, DespesaCategoriaResumo } from '../dados-dashboard';
import { Header } from '../../common/components/header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  imports: [Header, CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit{

  service = inject(DashboardService);
  dashboard$!: Observable<Dashboard>;

  ngOnInit(): void {
    this.dashboard$ = this.service.obterDashboardMesAtual();
  }

  percentual(valor: number, total: number){

    if(!total){
      return 0;
    }

    const resultado = (valor/total) * 100;

    return Math.round(resultado);
  }

  maiorDespesaCategoria(despesas: DespesaCategoriaResumo[]){
    if(!despesas.length){
      return 0;
    }
    const valoresDespesas = despesas.map(despesa => despesa.valor);
    return Math.max(...valoresDespesas);
  }

}
