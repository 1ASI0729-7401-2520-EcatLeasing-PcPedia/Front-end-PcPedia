// src/app/shared/pipes/currency-per-month.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'currencyPerMonth',
  standalone: true,
})
export class CurrencyPerMonthPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currency: string = 'PEN',
    locale: string = 'es-PE',
    digitsInfo: string = '1.2-2',
    showSuffix = true
  ): string {
    if (value === null || value === undefined || Number.isNaN(+value)) return '—';

    // ✅ "narrow" (no "symbol-narrow")
    const symbol = getCurrencySymbol(currency, 'narrow');
    const formatted = formatCurrency(+value, locale, symbol, currency, digitsInfo);

    if (!showSuffix) return formatted;
    const suffix = locale.toLowerCase().startsWith('es') ? '/mes' : '/month';
    return `${formatted} ${suffix}`;
  }
}
