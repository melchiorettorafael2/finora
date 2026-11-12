import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PeriodoRelatorio, Relatorio } from '../models/dados-relatorio';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {

  http = inject(HttpClient);
  baseUrl = `${environment.apiUrl}/relatorios`;

  obterRelatorio(periodo: PeriodoRelatorio): Observable<Relatorio> {
    return this.http.get<Relatorio>(this.baseUrl, { params: new HttpParams().set('meses', periodo) });
  }
}
