import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { ApiResponse } from '../../../../../shared/models/api-response.model';

export interface ClientDashboard {
  activeContracts: number;
  totalEquipment: number;
  pendingRequests: number;
  pendingQuotes: number;
  openTickets: number;
  pendingInvoices: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientDashboardService {
  private http = inject(HttpClient);

  getDashboard(): Observable<ClientDashboard> {
    return this.http.get<ApiResponse<ClientDashboard>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dashboard.client}`
    ).pipe(map(response => response.data));
  }
}
