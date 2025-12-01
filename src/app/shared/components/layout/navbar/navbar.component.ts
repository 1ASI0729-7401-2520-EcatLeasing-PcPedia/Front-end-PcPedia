import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LanguageService } from '../../../../core/i18n/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    TranslateModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="logo" routerLink="/">PcPedia</span>

      <span class="spacer"></span>

      <!-- Language Selector -->
      <button mat-icon-button [matMenuTriggerFor]="langMenu">
        <mat-icon>language</mat-icon>
      </button>
      <mat-menu #langMenu="matMenu">
        @for (lang of languageService.getAvailableLanguages(); track lang) {
          <button mat-menu-item (click)="languageService.setLanguage(lang)">
            <span [class.active]="languageService.currentLanguage() === lang">
              {{ lang === 'es' ? 'Español' : 'English' }}
            </span>
          </button>
        }
      </mat-menu>

      <!-- User Menu -->
      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <div class="user-info">
          <strong>{{ authService.currentUser()?.name }}</strong>
          <small>{{ authService.currentUser()?.email }}</small>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item [routerLink]="profileLink">
          <mat-icon>person</mat-icon>
          <span>{{ 'menu.profile' | translate }}</span>
        </button>
        <button mat-menu-item (click)="authService.logout()">
          <mat-icon>logout</mat-icon>
          <span>{{ 'auth.logout' | translate }}</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .logo {
      font-size: 20px;
      font-weight: 600;
      margin-left: 8px;
      cursor: pointer;
    }

    .spacer {
      flex: 1;
    }

    .user-info {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
    }

    .user-info small {
      color: #666;
      margin-top: 4px;
    }

    .active {
      font-weight: 600;
      color: #1A3458;
    }

    mat-divider {
      margin: 8px 0;
    }
  `]
})
export class NavbarComponent {
  @Input() profileLink = '/profile';
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  languageService = inject(LanguageService);
}
