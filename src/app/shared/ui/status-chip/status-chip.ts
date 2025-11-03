import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pc-status-chip',             // ⬅️ coincide con tu plantilla
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="pc-chip" [ngClass]="variant">{{ label }}</span>
  `,
  styleUrls: ['./status-chip.css'],
})
export class StatusChipComponent {
  @Input() label = '';
  @Input() variant:
    | 'open' | 'in_progress' | 'scheduled' | 'done' | 'closed'
    | 'low' | 'medium' | 'high' = 'open';
}
