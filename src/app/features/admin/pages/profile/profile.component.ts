import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/components/layout/page-header/page-header.component';
import { InputErrorComponent } from '../../../../shared/components/forms/input-error/input-error.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    TranslateModule,
    PageHeaderComponent,
    InputErrorComponent
  ],
  template: `
    <app-page-header
      title="profile.title"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.profile' }
      ]">
    </app-page-header>

    <div class="profile-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'profile.info' | translate }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <label>{{ 'users.name' | translate }}</label>
              <span>{{ authService.currentUser()?.name }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ authService.currentUser()?.email }}</span>
            </div>
            <div class="info-item">
              <label>{{ 'users.role' | translate }}</label>
              <span>{{ authService.currentUser()?.role }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'profile.changePassword' | translate }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'profile.currentPassword' | translate }}</mat-label>
              <input matInput type="password" formControlName="currentPassword">
              <mat-error>
                <app-input-error [control]="passwordForm.get('currentPassword')"></app-input-error>
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'profile.newPassword' | translate }}</mat-label>
              <input matInput type="password" formControlName="newPassword">
              <mat-error>
                <app-input-error [control]="passwordForm.get('newPassword')"></app-input-error>
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'profile.confirmPassword' | translate }}</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
              <mat-error>
                <app-input-error [control]="passwordForm.get('confirmPassword')"></app-input-error>
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'profile.updatePassword' | translate }}
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .info-grid {
      display: grid;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
  `]
})
export class AdminProfileComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private notification = inject(NotificationService);

  isSubmitting = signal(false);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.notification.error('Las contraseñas no coinciden');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notification.success('Contraseña actualizada correctamente');
        this.passwordForm.reset();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.notification.error(error.message || 'Error al cambiar la contraseña');
      }
    });
  }
}
