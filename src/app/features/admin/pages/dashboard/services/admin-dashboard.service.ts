import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { ApiResponse } from '../../../../../shared/models/api-response.model';

export interface AdminDashboard {
  totalClients: number;
  activeContracts: number;
  pendingRequests: number;
  pendingQuotes: number;
  openTickets: number;
  monthlyRevenue: number;
  pendingPayments: number;
  equipmentByStatus: {
    AVAILABLE: number;
    LEASED: number;
    MAINTENANCE: number;
    RETIRED: number;
  };
  ticketsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<ApiResponse<AdminDashboard>>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dashboard.admin}`
    ).pipe(map(response => response.data));
  }
}
