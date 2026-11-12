import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Dashboard } from './dados-dashboard';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  http = inject(HttpClient);
  baseUrl = `${environment.apiUrl}/dashboard`;

  /** mes no formato 'yyyy-MM' */
  obterDashboard(mes: string) : Observable<Dashboard>{
    return this.http.get<Dashboard>(this.baseUrl, { params: new HttpParams().set('mes', mes) });
  }

}
