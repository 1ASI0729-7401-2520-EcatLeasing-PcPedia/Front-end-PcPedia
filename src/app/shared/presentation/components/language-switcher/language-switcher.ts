import {Component, inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  currentLang = 'en';

  /** Available languages */
  languages = ['en', 'es'];
  /** Translation service */
  private translate: TranslateService;

  /** Create an instance of LanguageSwitcher.
   * Initialize translation service and set current language
   * */
  constructor() {
    this.translate = inject(TranslateService);
    this.currentLang = this.translate.getCurrentLang();
  }

  /** Change the current language
   * Update the translation service and current language
   * @param language - The language to switch to
   */
  useLanguage(language: string): void {
    this.translate.use(language);
    this.currentLang = language;
  }
}
