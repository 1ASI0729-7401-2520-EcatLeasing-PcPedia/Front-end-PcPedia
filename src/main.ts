// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 👇 Añade estas dos líneas:
import { registerLocaleData } from '@angular/common';
import esPE from '@angular/common/locales/es-PE';
registerLocaleData(esPE);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
