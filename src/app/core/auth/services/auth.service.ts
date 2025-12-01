import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { API_CONFIG } from '../../config/api.config';
import { LoginRequest, AuthResponse, ChangePasswordRequest } from '../models/auth.model';
import { User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  currentUser = signal<User | null>(null);

  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);
  isClient = computed(() => this.currentUser()?.role === Role.CLIENT);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.storage.getToken();
    const user = this.storage.getUser<User>();

    if (token && user) {
      this.currentUser.set(user);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`,
      credentials
    ).pipe(
      tap(response => {
        this.storage.setToken(response.data.token);
        this.storage.setUser(response.data.user);
        this.currentUser.set(response.data.user);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.logout}`,
      {}
    ).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    this.storage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.me}`
    ).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.storage.setUser(user);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.changePassword}`,
      request
    );
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  hasRole(role: Role): boolean {
    return this.currentUser()?.role === role;
  }

  redirectBasedOnRole(): void {
    const user = this.currentUser();
    if (user) {
      if (user.role === Role.ADMIN) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/client/dashboard']);
      }
    }
  }
}
