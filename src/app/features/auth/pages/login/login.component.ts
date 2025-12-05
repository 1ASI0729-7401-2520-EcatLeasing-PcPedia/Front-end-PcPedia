import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LanguageService } from '../../../../core/i18n/language.service';
import { InputErrorComponent } from '../../../../shared/components/forms/input-error/input-error.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    TranslateModule,
    InputErrorComponent,
    AutofocusDirective
  ],
  template: `
    <div class="login-container">
      <div class="login-wrapper">
        <mat-card class="login-card">
          <mat-card-header>
            <div class="logo-container">
              <h1 class="logo">PcPedia</h1>
              <p class="tagline">{{ 'auth.tagline' | translate }}</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.email' | translate }}</mat-label>
                <input matInput
                       type="email"
                       formControlName="email"
                       appAutofocus
                       autocomplete="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error>
                  <app-input-error [control]="loginForm.get('email')"></app-input-error>
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.password' | translate }}</mat-label>
                <input matInput
                       [type]="hidePassword() ? 'password' : 'text'"
                       formControlName="password"
                       autocomplete="current-password">
                <button mat-icon-button
                        matSuffix
                        type="button"
                        (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error>
                  <app-input-error [control]="loginForm.get('password')"></app-input-error>
                </mat-error>
              </mat-form-field>

              <div class="form-options">
                <mat-checkbox formControlName="rememberMe">
                  {{ 'auth.rememberMe' | translate }}
                </mat-checkbox>
                <a routerLink="/forgot-password" class="forgot-link">
                  {{ 'auth.forgotPassword' | translate }}
                </a>
              </div>

              <button mat-raised-button
                      color="primary"
                      type="submit"
                      class="full-width login-btn"
                      [disabled]="isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'auth.login' | translate }}
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="language-selector">
          <mat-form-field appearance="outline">
            <mat-select [value]="languageService.currentLanguage()"
                        (selectionChange)="languageService.setLanguage($event.value)">
              <mat-option value="es">Español</mat-option>
              <mat-option value="en">English</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1A3458 0%, #00D9FF 100%);
      padding: 24px;
    }

    .login-wrapper {
      width: 100%;
      max-width: 420px;
    }

    .login-card {
      padding: 32px;
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .logo-container {
      text-align: center;
    }

    .logo {
      font-size: 36px;
      font-weight: 700;
      color: #1A3458;
      margin: 0;
    }

    .tagline {
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

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .forgot-link {
      color: #1A3458;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .login-btn {
      height: 48px;
      font-size: 16px;
    }

    .login-btn mat-spinner {
      display: inline-block;
    }

    .language-selector {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }

    .language-selector mat-form-field {
      width: 140px;
    }

    ::ng-deep .language-selector .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.9);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  languageService = inject(LanguageService);

  isLoading = signal(false);
  hidePassword = signal(true);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const userName = response.data.user?.name || response.data.user?.email || 'Usuario';
        this.notification.success(
          `Bienvenido, ${userName}`,
          'Inicio de sesión exitoso'
        );
        this.authService.redirectBasedOnRole();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notification.error(
          error.message || 'Credenciales inválidas',
          'Error de autenticación'
        );
      }
    });
  }
}
