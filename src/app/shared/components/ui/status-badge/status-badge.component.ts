import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusTranslatePipe } from '../../../pipes/status-translate.pipe';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, StatusTranslatePipe],
  template: `
    <span class="status-badge" [ngClass]="getStatusClass()">
      {{ status | statusTranslate }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    /* Equipment Status */
    .status-available { background: #e8f5e9; color: #2e7d32; }
    .status-leased { background: #e3f2fd; color: #1565c0; }
    .status-maintenance { background: #fff3e0; color: #ef6c00; }
    .status-retired { background: #f5f5f5; color: #616161; }

    /* Request Status */
    .status-pending { background: #fff3e0; color: #ef6c00; }
    .status-quoted { background: #e3f2fd; color: #1565c0; }
    .status-rejected { background: #ffebee; color: #c62828; }

    /* Quote Status */
    .status-draft { background: #f5f5f5; color: #616161; }
    .status-sent { background: #e3f2fd; color: #1565c0; }
    .status-accepted { background: #e8f5e9; color: #2e7d32; }
    .status-expired { background: #f5f5f5; color: #616161; }

    /* Contract Status */
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .status-renewed { background: #e3f2fd; color: #1565c0; }

    /* Ticket Status */
    .status-open { background: #ffebee; color: #c62828; }
    .status-in_progress { background: #fff3e0; color: #ef6c00; }
    .status-resolved { background: #e8f5e9; color: #2e7d32; }
    .status-closed { background: #f5f5f5; color: #616161; }

    /* Invoice Status */
    .status-paid { background: #e8f5e9; color: #2e7d32; }
    .status-overdue { background: #ffebee; color: #c62828; }

    /* Priority */
    .priority-low { background: #e8f5e9; color: #2e7d32; }
    .priority-medium { background: #fff3e0; color: #ef6c00; }
    .priority-high { background: #ffebee; color: #c62828; }
    .priority-urgent { background: #c62828; color: #fff; }
  `]
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() type: 'status' | 'priority' = 'status';

  getStatusClass(): string {
    if (!this.status) return 'status-unknown';
    const prefix = this.type === 'priority' ? 'priority' : 'status';
    return `${prefix}-${this.status.toLowerCase()}`;
  }
}
