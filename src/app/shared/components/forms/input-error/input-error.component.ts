import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (control && control.invalid && (control.dirty || control.touched)) {
      <div class="error-messages">
        @if (control.hasError('required')) {
          <span>{{ 'validation.required' | translate }}</span>
        }
        @if (control.hasError('email')) {
          <span>{{ 'validation.email' | translate }}</span>
        }
        @if (control.hasError('minlength')) {
          <span>{{ 'validation.minLength' | translate: { min: control.getError('minlength').requiredLength } }}</span>
        }
        @if (control.hasError('maxlength')) {
          <span>{{ 'validation.maxLength' | translate: { max: control.getError('maxlength').requiredLength } }}</span>
        }
        @if (control.hasError('min')) {
          <span>{{ 'validation.min' | translate: { min: control.getError('min').min } }}</span>
        }
        @if (control.hasError('max')) {
          <span>{{ 'validation.max' | translate: { max: control.getError('max').max } }}</span>
        }
        @if (control.hasError('pattern')) {
          <span>{{ 'validation.pattern' | translate }}</span>
        }
        @if (control.hasError('custom')) {
          <span>{{ control.getError('custom') }}</span>
        }
      </div>
    }
  `,
  styles: [`
    .error-messages {
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-messages span {
      display: block;
    }
  `]
})
export class InputErrorComponent {
  @Input() control: AbstractControl | null = null;
}
