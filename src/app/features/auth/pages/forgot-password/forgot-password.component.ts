import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../../core/services/notification.service';
import { InputErrorComponent } from '../../../../shared/components/forms/input-error/input-error.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    InputErrorComponent
  ],
  template: `
    <div class="forgot-container">
      <mat-card class="forgot-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="header-icon">lock_reset</mat-icon>
            <h2>{{ 'auth.forgotPasswordTitle' | translate }}</h2>
            <p>{{ 'auth.forgotPasswordSubtitle' | translate }}</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (!emailSent()) {
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.email' | translate }}</mat-label>
                <input matInput
                       type="email"
                       formControlName="email"
                       autocomplete="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error>
                  <app-input-error [control]="forgotForm.get('email')"></app-input-error>
                </mat-error>
              </mat-form-field>

              <button mat-raised-button
                      color="primary"
                      type="submit"
                      class="full-width submit-btn"
                      [disabled]="isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'auth.sendResetLink' | translate }}
                }
              </button>
            </form>
          } @else {
            <div class="success-message">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h3>{{ 'auth.emailSent' | translate }}</h3>
              <p>{{ 'auth.checkEmailMessage' | translate }}</p>
            </div>
          }

          <div class="back-link">
            <a routerLink="/login">
              <mat-icon>arrow_back</mat-icon>
              {{ 'auth.backToLogin' | translate }}
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1A3458 0%, #00D9FF 100%);
      padding: 24px;
    }

    .forgot-card {
      width: 100%;
      max-width: 420px;
      padding: 32px;
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .header-content {
      text-align: center;
    }

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1A3458;
      margin-bottom: 16px;
    }

    .header-content h2 {
      margin: 0;
      color: #1A3458;
    }

    .header-content p {
      color: #666;
      margin: 8px 0 0 0;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 16px;
    }

    .submit-btn {
      height: 48px;
      font-size: 16px;
    }

    .success-message {
      text-align: center;
      padding: 24px 0;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .success-message h3 {
      margin: 0;
      color: #1A3458;
    }

    .success-message p {
      color: #666;
      margin: 8px 0 0 0;
    }

    .back-link {
      margin-top: 24px;
      text-align: center;
    }

    .back-link a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #1A3458;
      text-decoration: none;
    }

    .back-link a:hover {
      text-decoration: underline;
    }

    .back-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  isLoading = signal(false);
  emailSent = signal(false);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      this.emailSent.set(true);
      this.notification.success(
        'Se ha enviado un correo con las instrucciones',
        'Correo enviado'
      );
    }, 1500);
  }
}
