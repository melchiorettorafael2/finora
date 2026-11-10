import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PeriodoRelatorio, Relatorio } from '../models/dados-relatorio';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {

  http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/relatorios';

  obterRelatorio(periodo: PeriodoRelatorio): Observable<Relatorio> {
    return this.http.get<Relatorio>(this.baseUrl, { params: new HttpParams().set('meses', periodo) });
  }
}
