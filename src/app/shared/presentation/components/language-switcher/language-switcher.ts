import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../../core/services/translation.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslatePipe],
  template: `
    <select [(ngModel)]="currentLang" (change)="useLanguage(currentLang)">
      <option value="es">{{ 'PROFILE.SPANISH' | translate }}</option>
      <option value="en">{{ 'PROFILE.ENGLISH' | translate }}</option>
    </select>
  `,
  styles: [`
    select {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background-color: #f8fafc;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  /**
   * Standard language
   */
  currentLang = 'es';
  /**
   * All languages for the web
   */
  languages = ['es', 'en']

  /**
   * Service to translate the web
   */
  private translate: TranslateService;

  /**
   * Initial configuration language
   */
  constructor() {
    this.translate = inject(TranslateService);
    this.currentLang = this.translate.getCurrentLang();
  }

  /**
   * Implement for first time the service in web
   */
  ngOnInit() {
    this.currentLang = localStorage.getItem('lang') || 'es';
    this.useLanguage(this.currentLang);
  }

  /**
   * method to convert languages: (en to es) or (es to en)
   */
  useLanguage(language: string) {
    this.translate.use(language);
    this.currentLang = language;
  }
}
