import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
  date: string | Date;
  title: string;
  description?: string;
  tone?: 'ok' | 'warning' | 'error' | 'info' | 'neutral';
}

@Component({
  selector: 'pc-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.css'],
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];

  // Helpers referenciados en timeline.html
  asDate(d: string | Date): Date {
    return d instanceof Date ? d : new Date(d);
  }

  when(d: string | Date): string {
    const date = this.asDate(d);
    // dale el formato que prefieras
    return date.toLocaleString();
  }

  toneClass(tone?: TimelineItem['tone']): string {
    switch (tone) {
      case 'ok': return 'tl-ok';
      case 'warning': return 'tl-warn';
      case 'error': return 'tl-error';
      case 'info': return 'tl-info';
      default: return 'tl-neutral';
    }
  }
}
