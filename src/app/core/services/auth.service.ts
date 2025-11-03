// src/app/core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  customerId: string;
  avatarUrl?: string;
};

const STORAGE_KEY = 'pcp_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<AuthUser | null>(null);

  constructor(private router: Router) {
    // restaurar sesión si existe
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { this._currentUser.set(JSON.parse(raw)); } catch {}
    }
  }

  /** Signal accesible en la app: auth.currentUser() -> AuthUser | null */
  get currentUser() {
    return this._currentUser;
  }

  /** Demo login (mock). En tu app real, llama a tu endpoint */
  async login(email: string, password: string) {
    // Mock muy básico: dos usuarios del db.json
    const demoMap: Record<string, AuthUser & {password: string}> = {
      'demo@pcpedia.local': {
        id: 'u_cus_demo',
        email: 'demo@pcpedia.local',
        displayName: 'Sebastián Hernández',
        customerId: 'cus_demo',
        password: 'demo123',
        avatarUrl: '/assets/avatars/customer.png',
      },
      'sebastian@pcpedia.local': {
        id: 'u_admin',
        email: 'sebastian@pcpedia.local',
        displayName: 'Sebastián Hernández',
        customerId: 'cus_demo',
        password: 'admin123',
        avatarUrl: '/assets/avatars/customer.png',
      }
    };

    const found = demoMap[email];
    if (!found || found.password !== password) {
      throw new Error('Credenciales inválidas');
    }

    const { password: _remove, ...user } = found;
    this._currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
