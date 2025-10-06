import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideTranslateService,
  TranslateService
} from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    // Manejo global de errores y detección optimizada de zonas
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 🚀 Enrutamiento
    provideRouter(routes),

    // 🌐 HTTP + Fetch (Angular standalone moderno)
    provideHttpClient(withFetch()),

    // 🌎 Internacionalización (i18n)
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        // ✅ Ajuste importante: Angular busca en /assets o /public
        prefix: './assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'es'
    })
  ]
};
