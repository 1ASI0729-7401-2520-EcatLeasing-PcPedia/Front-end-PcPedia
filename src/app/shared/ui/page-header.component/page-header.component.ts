// src/app/shared/ui/page-header.component/page-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Breadcrumb {
  label: string;
  url?: string | any[];   // admite string o comandos de router
  link?: string | any[];   // ← si tu template usa .link
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css'],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;

  // 👇 props usadas en el HTML
  @Input() showBack = false;
  @Input() breadcrumbs: Breadcrumb[] = [];

  // si el template llama (click)="onBack()"
  @Output() back = new EventEmitter<void>();
  onBack() { this.back.emit(); }
}
