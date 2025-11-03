import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.css'],
})
export class AppToolbarComponent {
  @Input() title = 'PcPedia • Admin';
  @Input() userName = 'Sebastián';
  @Input() notifications = 0;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onMenu() { this.menuToggle.emit(); }
  onTheme() { this.themeToggle.emit(); }
  onLogout() { this.logout.emit(); }
}
