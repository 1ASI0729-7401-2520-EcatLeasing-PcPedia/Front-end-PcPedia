import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: string = 'dd/MM/yyyy'): string {
    if (!value) {
      return '-';
    }

    try {
      return formatDate(value, format, 'en-US');
    } catch (e) {
      console.error('DateFormatPipe error:', e, 'value:', value);
      return '-';
    }
  }
}
