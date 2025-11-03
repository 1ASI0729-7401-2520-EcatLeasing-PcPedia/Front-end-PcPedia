// src/app/shared/material/material.config.ts
import { Provider } from '@angular/core';

import {
  MAT_DATE_LOCALE,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
  provideNativeDateAdapter,
} from '@angular/material/core';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatIconRegistry } from '@angular/material/icon';

import { MATERIAL_THEME, MaterialThemeConfig } from './material.tokens';

export type ProvideMaterialOptions = Partial<MaterialThemeConfig>;

const DEFAULTS: MaterialThemeConfig = {
  colorScheme: 'light',
  // Nota: si tu interfaz incluye `density`, lo mantenemos en config,
  // pero no se aplica vía token global (ver comentario más abajo).
  density: 0,
  formFieldAppearance: 'outline',
  snackbarDuration: 3500,
  locale: 'es-PE',
};

export function provideMaterial(opts?: ProvideMaterialOptions): Provider[] {
  const cfg: MaterialThemeConfig = { ...DEFAULTS, ...(opts ?? {}) };

  const ripple: RippleGlobalOptions = {
    disabled: false,
    animation: { enterDuration: 250, exitDuration: 150 },
  };

  return [
    // Tema/config propia
    { provide: MATERIAL_THEME, useValue: cfg },

    // Form field (outline/fill)
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: cfg.formFieldAppearance },
    },

    // SnackBar por defecto
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: cfg.snackbarDuration,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      },
    },

    // Locale y DateAdapter nativo
    { provide: MAT_DATE_LOCALE, useValue: cfg.locale },
    provideNativeDateAdapter(),

    // Ripple global
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: ripple },

    // Registro de íconos (si usarás SVG/material icons)
    MatIconRegistry,
  ];
}
