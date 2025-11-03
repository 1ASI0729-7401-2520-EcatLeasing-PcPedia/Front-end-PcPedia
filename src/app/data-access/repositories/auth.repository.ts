import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, of } from 'rxjs';
import { Router } from '@angular/router';

type User = {
  id: string;
  email: string;
  password: string;
  display_name: string;
  customer_id: string;
};

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiBase}/users`;

  login(email: string, password: string) {
    return this.http.get<User[]>(`${this.base}?email=${email}&password=${password}`).pipe(
      map(users => {
        const user = users[0];
        if (user) {
          localStorage.setItem('auth_user', JSON.stringify(user));
          return true;
        }
        return false;
      })
    );
  }

  logout() {
    localStorage.removeItem('auth_user');
    this.router.navigate(['/login']);
  }

  currentUser(): User | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }

  customerId(): string | null {
    return this.currentUser()?.customer_id ?? null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_user');
  }
}
