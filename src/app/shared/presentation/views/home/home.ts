import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  usuario: any = null;
  servicios: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();

    if (this.usuario) {
      this.servicios = this.usuario.servicios;
    }
  }

  getDescripcion(servicio: string): string {
    switch (servicio) {
      case 'Arrendamiento':
        return 'Servicio de leasing tecnológico con soporte incluido.';
      case 'Soporte Técnico':
        return 'Atención personalizada para resolver incidencias y mantenimiento.';
      case 'Gestión de Garantías':
        return 'Seguimiento y control de garantías de tus dispositivos.';
      default:
        return 'Servicio especializado de la empresa.';
    }
  }

}

