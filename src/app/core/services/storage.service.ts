import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'pcpedia_token';
  private readonly USER_KEY = 'pcpedia_user';
  private readonly LANGUAGE_KEY = 'pcpedia_language';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUser(user: object): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser<T>(): T | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  setLanguage(lang: string): void {
    localStorage.setItem(this.LANGUAGE_KEY, lang);
  }

  getLanguage(): string | null {
    return localStorage.getItem(this.LANGUAGE_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
