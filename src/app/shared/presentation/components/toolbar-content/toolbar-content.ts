import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-toolbar-content',
  standalone: true,
  imports: [
    RouterModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    NgFor
  ],
  templateUrl: './toolbar-content.html',
  styleUrls: ['./toolbar-content.css']
})
export class ToolbarContent {
  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/inicio' },
    { icon: 'bar_chart', label: 'Informes', route: '/informes' },
    { icon: 'description', label: 'Contratos', route: '/contratos' },
    { icon: 'report', label: 'Incidentes', route: '/incidents' },
    { icon: 'shopping_cart', label: 'Tienda', route: '/tienda' },
    { icon: 'person', label: 'Mi perfil', route: '/perfil' },
    { icon: 'logout', label: 'Cerrar sesión', route: '/logout' }
  ];
}
