import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'statusTranslate',
  standalone: true,
  pure: false
})
export class StatusTranslatePipe implements PipeTransform {
  private translate = inject(TranslateService);

  transform(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    return this.translate.instant(`status.${value}`);
  }
}
