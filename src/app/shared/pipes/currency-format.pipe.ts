import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = 'S/.'): string {
    if (value === null || value === undefined) {
      return `${currency} 0.00`;
    }

    return `${currency} ${value.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
