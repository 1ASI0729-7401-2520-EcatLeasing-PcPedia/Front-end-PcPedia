// Tokens y tipos de configuración de Angular Material (a nivel app)
import { InjectionToken } from '@angular/core';

export type ColorScheme = 'light' | 'dark';

export interface MaterialThemeConfig {
  /** light | dark (para que tu layout pueda alternar clases o data-theme) */
  colorScheme: ColorScheme;
  /** Densidad global de Material: 0 (normal), -1 (compact), -2 (muy compacto) */
  density: 0 | -1 | -2;
  /** Apariencia por defecto de form-field */
  formFieldAppearance: 'fill' | 'outline';
  /** ms de duración por defecto para snackbars */
  snackbarDuration: number;
  /** Locale para Date, MatPaginator, etc. */
  locale: string; // ej. 'es-PE'
}

/** Config global declarativa que puedes leer/inyectar en cualquier parte */
export const MATERIAL_THEME = new InjectionToken<MaterialThemeConfig>('MATERIAL_THEME');
