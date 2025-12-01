import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          @if (breadcrumbs.length > 0) {
            <nav class="breadcrumbs">
              @for (item of breadcrumbs; track item.label; let last = $last) {
                @if (item.route && !last) {
                  <a [routerLink]="item.route">{{ item.label | translate }}</a>
                } @else {
                  <span [class.current]="last">{{ item.label | translate }}</span>
                }
                @if (!last) {
                  <mat-icon class="separator">chevron_right</mat-icon>
                }
              }
            </nav>
          }
          <h1 class="page-title">{{ title | translate }}</h1>
          @if (subtitle) {
            <p class="page-subtitle">{{ subtitle | translate }}</p>
          }
        </div>
        <div class="header-actions">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-info {
      flex: 1;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .breadcrumbs a {
      color: #666;
      text-decoration: none;
    }

    .breadcrumbs a:hover {
      color: #1A3458;
    }

    .breadcrumbs .current {
      color: #1A3458;
      font-weight: 500;
    }

    .breadcrumbs .separator {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1A3458;
    }

    .page-subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: Breadcrumb[] = [];
}
