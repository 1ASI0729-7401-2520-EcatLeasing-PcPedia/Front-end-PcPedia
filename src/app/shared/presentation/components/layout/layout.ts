import { Component } from '@angular/core';
import { ToolbarContent } from '../toolbar-content/toolbar-content';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ToolbarContent, RouterOutlet, MatToolbar, CommonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {
  isLoginPage = false;

  constructor(private router: Router) {
    // Detectar cambios de ruta y verificar si estás en /login
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url === '/login';
    });
  }
}
