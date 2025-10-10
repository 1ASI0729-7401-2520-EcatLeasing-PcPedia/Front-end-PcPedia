import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../../core/services/translation.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslatePipe],
  template: `
    <select [(ngModel)]="selectedLang" (change)="changeLanguage()">
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
  selectedLang = 'es';

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.selectedLang = localStorage.getItem('lang') || 'es';
  }

  changeLanguage() {
    this.translationService.setLanguage(this.selectedLang);
  }
}
