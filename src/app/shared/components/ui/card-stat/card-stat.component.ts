import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';

@Component({
  selector: 'app-card-stat',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterLink, CurrencyFormatPipe],
  template: `
    <mat-card class="stat-card" [class.clickable]="link" [routerLink]="link">
      <mat-card-content>
        <div class="stat-content">
          <div class="stat-info">
            <span class="stat-value">
              @if (isCurrency) {
                {{ numValue | currencyFormat }}
              } @else {
                {{ value }}
              }
            </span>
            <span class="stat-label">{{ label }}</span>
          </div>
          <div class="stat-icon" [style.background]="iconBg">
            <mat-icon>{{ icon }}</mat-icon>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stat-card {
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card.clickable {
      cursor: pointer;
    }

    .stat-card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #1A3458;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }
  `]
})
export class CardStatComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = 'trending_up';
  @Input() iconBg = '#1A3458';
  @Input() link: string | null = null;
  @Input() isCurrency = false;

  get numValue(): number {
    return typeof this.value === 'number' ? this.value : parseFloat(this.value) || 0;
  }
}
