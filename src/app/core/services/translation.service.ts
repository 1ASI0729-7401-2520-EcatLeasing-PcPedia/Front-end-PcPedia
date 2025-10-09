import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private language = new BehaviorSubject<string>('es');
  private translations: any = {};

  constructor(private http: HttpClient) {
    const savedLang = localStorage.getItem('lang') || 'es';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.http.get(`/assets/i18n/${lang}.json`).subscribe(data => {
      this.translations = data;
      this.language.next(lang);
      localStorage.setItem('lang', lang);
    });
  }

  get currentLang() {
    return this.language.asObservable();
  }

  translate(path: string): string {
    const keys = path.split('.');
    let result = this.translations;
    for (const key of keys) {
      result = result ? result[key] : null;
    }
    return result || path;
  }
}
