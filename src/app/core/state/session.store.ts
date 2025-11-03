import { Injectable, computed, effect, signal } from '@angular/core';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];          // e.g., ["customer"]
  avatarUrl?: string;
  tenant?: string;          // customer/company slug if you need multi-tenant
}

export interface SessionState {
  token: string | null;
  user: SessionUser | null;
}

const LS_KEY = 'pcpedia.session.v1';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _state = signal<SessionState>(this.hydrate());

  // selectors
  readonly token = computed(() => this._state().token);
  readonly user  = computed(() => this._state().user);
  readonly isAuthenticated = computed(() => !!this._state().token && !!this._state().user);
  readonly roles = computed(() => this._state().user?.roles ?? []);

  // mutations
  setSession(session: SessionState) { this._state.set(session); }
  clear() { this._state.set({ token: null, user: null }); }

  // ——— persistence ———
  constructor() {
    effect(() => {
      const current = this._state();
      localStorage.setItem(LS_KEY, JSON.stringify(current));
    }, { allowSignalWrites: true });
  }

  private hydrate(): SessionState {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) as SessionState : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  }
}
