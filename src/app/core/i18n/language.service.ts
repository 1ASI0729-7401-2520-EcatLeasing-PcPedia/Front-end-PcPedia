import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private storage = inject(StorageService);

  currentLanguage = signal<string>(environment.defaultLanguage);

  init(): void {
    this.translate.addLangs(environment.supportedLanguages);
    this.translate.setDefaultLang(environment.defaultLanguage);

    const savedLang = this.storage.getLanguage();
    const browserLang = this.translate.getBrowserLang();

    let langToUse = environment.defaultLanguage;

    if (savedLang && environment.supportedLanguages.includes(savedLang)) {
      langToUse = savedLang;
    } else if (browserLang && environment.supportedLanguages.includes(browserLang)) {
      langToUse = browserLang;
    }

    this.setLanguage(langToUse);
  }

  setLanguage(lang: string): void {
    if (environment.supportedLanguages.includes(lang)) {
      this.translate.use(lang);
      this.storage.setLanguage(lang);
      this.currentLanguage.set(lang);
    }
  }

  getAvailableLanguages(): string[] {
    return environment.supportedLanguages;
  }
}
