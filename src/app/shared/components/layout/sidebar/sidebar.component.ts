import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  divider?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="mode"
        [opened]="opened"
        (openedChange)="openedChange.emit($event)"
        class="sidenav">
        <mat-nav-list>
          @for (item of menuItems; track item.route) {
            @if (item.divider) {
              <mat-divider></mat-divider>
            }
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.route.endsWith('dashboard') }">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label | translate }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: calc(100vh - 64px);
      margin-top: 64px;
    }

    .sidenav {
      width: 260px;
      padding-top: 8px;
    }

    .content {
      padding: 24px;
      background: #f5f5f5;
      min-height: 100%;
    }

    a.active {
      background: rgba(26, 52, 88, 0.1);
      color: #1A3458;
    }

    a.active mat-icon {
      color: #1A3458;
    }

    mat-divider {
      margin: 8px 0;
    }
  `]
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() mode: 'side' | 'over' = 'side';
  @Input() opened = true;
  @Output() openedChange = new EventEmitter<boolean>();
}
