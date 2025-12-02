import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../../../core/config/api.config';
import { Page, PageParams } from '../../../../../shared/models/pagination.model';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users}`;

  getUsers(params: PageParams = {}): Observable<Page<User>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('isActive', params.status);

    return this.http.get<ApiResponse<Page<User>>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getUser(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, user)
      .pipe(map(response => response.data));
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user)
      .pipe(map(response => response.data));
  }

  toggleStatus(id: number): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/status`, {})
      .pipe(map(response => response.data));
  }
}
