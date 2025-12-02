import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tickets-chart',
  standalone: true,
  imports: [MatCardModule, NgChartsModule, TranslateModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ 'dashboard.ticketsByPriority' | translate }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container">
          <canvas baseChart
            [data]="chartData"
            [options]="chartOptions"
            type="bar">
          </canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-container {
      height: 300px;
    }
  `]
})
export class TicketsChartComponent implements OnChanges {
  @Input() data: { LOW: number; MEDIUM: number; HIGH: number; URGENT: number } | null = null;

  constructor(private translate: TranslateService) {}

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9c27b0'],
      label: 'Tickets'
    }]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.chartData = {
        labels: [
          this.translate.instant('priority.LOW'),
          this.translate.instant('priority.MEDIUM'),
          this.translate.instant('priority.HIGH'),
          this.translate.instant('priority.URGENT')
        ],
        datasets: [{
          data: [
            this.data.LOW,
            this.data.MEDIUM,
            this.data.HIGH,
            this.data.URGENT
          ],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9c27b0'],
          label: 'Tickets'
        }]
      };
    }
  }
}
