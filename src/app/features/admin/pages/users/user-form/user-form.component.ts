import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { InputErrorComponent } from '../../../../../shared/components/forms/input-error/input-error.component';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    InputErrorComponent
  ],
  template: `
    <app-page-header
      [title]="isEditMode() ? 'users.editUser' : 'users.newUser'"
      [breadcrumbs]="[
        { label: 'menu.dashboard', route: '/admin/dashboard' },
        { label: 'menu.users', route: '/admin/users' },
        { label: isEditMode() ? 'common.edit' : 'common.create' }
      ]">
    </app-page-header>

    @if (isLoadingData()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <mat-card>
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'users.email' | translate }}</mat-label>
                <input matInput type="email" formControlName="email" [readonly]="isEditMode()">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error>
                  <app-input-error [control]="userForm.get('email')"></app-input-error>
                </mat-error>
              </mat-form-field>

              @if (!isEditMode()) {
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'users.password' | translate }}</mat-label>
                  <input matInput type="password" formControlName="password">
                  <mat-icon matSuffix>lock</mat-icon>
                  <mat-error>
                    <app-input-error [control]="userForm.get('password')"></app-input-error>
                  </mat-error>
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>{{ 'users.name' | translate }}</mat-label>
                <input matInput formControlName="name">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error>
                  <app-input-error [control]="userForm.get('name')"></app-input-error>
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'users.company' | translate }}</mat-label>
                <input matInput formControlName="companyName">
                <mat-icon matSuffix>business</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>RUC</mat-label>
                <input matInput formControlName="ruc" maxlength="11">
                <mat-icon matSuffix>badge</mat-icon>
                <mat-hint>11 dígitos</mat-hint>
                <mat-error>
                  <app-input-error [control]="userForm.get('ruc')"></app-input-error>
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'users.phone' | translate }}</mat-label>
                <input matInput formControlName="phone">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'users.address' | translate }}</mat-label>
                <textarea matInput formControlName="address" rows="3"></textarea>
                <mat-icon matSuffix>location_on</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/users">
                {{ 'common.cancel' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting()">
                @if (isSubmitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'common.save' | translate }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  isLoadingData = signal(false);
  isSubmitting = signal(false);
  userId: number | null = null;

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    name: ['', [Validators.required]],
    companyName: [''],
    ruc: ['', [Validators.pattern(/^\d{11}$/)]],
    phone: [''],
    address: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.userId = +id;
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser();
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.isLoadingData.set(true);
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          name: user.name,
          companyName: user.companyName,
          ruc: user.ruc,
          phone: user.phone,
          address: user.address
        });
        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
        this.notification.error('Error al cargar el cliente');
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.userForm.value;

    if (this.isEditMode() && this.userId) {
      const { email, password, ...updateData } = formValue;
      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notification.success('Cliente actualizado correctamente');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.notification.error(error.message || 'Error al actualizar el cliente');
        }
      });
    } else {
      this.userService.createUser(formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notification.success('Cliente creado correctamente');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.notification.error(error.message || 'Error al crear el cliente');
        }
      });
    }
  }
}
