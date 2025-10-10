import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractsService} from '../../../../core/services/contracts.service';
import { AuthService} from '../../../../core/services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  contratos: any[] = [];
  empresaId!: number;

  contratosActivos = 0;
  equiposTotales = 0;
  incidentesTotales = 0;

  @ViewChild('chartModelos') chartModelosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartTipos') chartTiposRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private contractsService: ContractsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.empresaId = user.id;
      this.loadData();
    }
  }

  loadData() {
    this.contractsService.getContractsByEmpresa(this.empresaId).subscribe(data => {
      this.contratos = data;
      this.calcularKPIs();
      this.generarGraficos();
    });
  }

  calcularKPIs() {
    const hoy = new Date();
    this.contratosActivos = this.contratos.filter(c => {
      const inicio = new Date(c.fechaInicio);
      const fin = new Date(c.fechaFin);
      return hoy >= inicio && hoy <= fin;
    }).length;

    this.equiposTotales = this.contratos.reduce((sum, c) => sum + (c.equipos || 0), 0);

    this.incidentesTotales = this.contratos.reduce((sum, c) => {
      const totalInc = c.incidentes ? c.incidentes.reduce((t: number, i: any) => t + i.cantidad, 0) : 0;
      return sum + totalInc;
    }, 0);
  }

  generarGraficos() {
    const modelos: { [key: string]: number } = {};
    const tipos: { [key: string]: number } = {};

    // Recorremos contratos
    this.contratos.forEach(c => {
      c.detalles.forEach((d: any) => {
        tipos[d.tipo] = (tipos[d.tipo] || 0) + d.modelos.reduce((s: number, m: any) => s + m.cantidad, 0);

        d.modelos.forEach((m: any) => {
          modelos[m.nombre] = (modelos[m.nombre] || 0) + m.cantidad;
        });
      });
    });

    // --- Gráfico de barras (Modelos)
    const ctxModelos = this.chartModelosRef.nativeElement.getContext('2d');
    new Chart(ctxModelos!, {
      type: 'bar',
      data: {
        labels: Object.keys(modelos),
        datasets: [
          {
            label: 'Cantidad',
            data: Object.values(modelos),
            backgroundColor: '#3B82F6'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // --- Gráfico de pastel (Tipos)
    const ctxTipos = this.chartTiposRef.nativeElement.getContext('2d');
    new Chart(ctxTipos!, {
      type: 'pie',
      data: {
        labels: Object.keys(tipos),
        datasets: [
          {
            data: Object.values(tipos),
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
          }
        ]
      },
      options: { responsive: true }
    });
  }
}
