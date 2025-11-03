import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  icon?: string;     // emoji o texto corto
  route: string | any[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app-sidenav.component.html',
  styleUrls: ['./app-sidenav.component.css'],
})
export class AppSidenavComponent {
  @Input() opened = true;
  @Input() items: NavItem[] = [];
  @Output() navigate = new EventEmitter<void>();
}
