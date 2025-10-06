import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    console.log('🔍 URL solicitada:', url);

    return this.http.get<User[]>(url).pipe(
      map(users => {
        console.log('📦 Resultado del servidor:', users);
        if (users.length > 0) {
          this.currentUser = users[0];
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          return true;
        } else {
          console.warn('❌ Usuario o contraseña incorrectos');
          return false;
        }
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  getCurrentUser(): User | null {
    return this.currentUser || JSON.parse(localStorage.getItem('user')!);
  }
}
