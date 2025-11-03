import { Injectable, computed, signal } from '@angular/core';
import { SessionUser } from './session.model';

const LS_KEY = 'app.session.user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _user = signal<SessionUser | null>(this.loadFromStorage());

  /** Señal de usuario actual (o null) */
  readonly user = this._user;

  /** Está autenticado */
  readonly isAuthenticated = computed(() => !!this._user());

  /** Roles helper */
  readonly roles = computed(() => this._user()?.roles ?? []);

  /** Establecer usuario (login / refresh) */
  setUser(u: SessionUser | null): void {
    this._user.set(u);
    if (u) localStorage.setItem(LS_KEY, JSON.stringify(u));
    else localStorage.removeItem(LS_KEY);
  }

  /** Logout */
  clear(): void {
    this.setUser(null);
  }

  // --- privados ---
  private loadFromStorage(): SessionUser | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }
}
