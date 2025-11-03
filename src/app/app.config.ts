// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';

import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { provideMaterial } from './shared/material/material.config';
import {BaseUrlInterceptor} from './core/interceptors/base-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withViewTransitions()),

    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideMaterial(),

    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    // 👇 Añadidos para resolver NG0701 y formatear moneda/fecha en Perú
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN' },
  ],
};
