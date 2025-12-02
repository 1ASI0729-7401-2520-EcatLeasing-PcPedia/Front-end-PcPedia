import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-equipment-chart',
  standalone: true,
  imports: [MatCardModule, NgChartsModule, TranslateModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ 'dashboard.equipmentByStatus' | translate }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container">
          <canvas baseChart
            [data]="chartData"
            [options]="chartOptions"
            type="doughnut">
          </canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-container {
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class EquipmentChartComponent implements OnChanges {
  @Input() data: { AVAILABLE: number; LEASED: number; MAINTENANCE: number; RETIRED: number } | null = null;

  constructor(private translate: TranslateService) {}

  chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9e9e9e']
    }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.chartData = {
        labels: [
          this.translate.instant('status.AVAILABLE'),
          this.translate.instant('status.LEASED'),
          this.translate.instant('status.MAINTENANCE'),
          this.translate.instant('status.RETIRED')
        ],
        datasets: [{
          data: [
            this.data.AVAILABLE,
            this.data.LEASED,
            this.data.MAINTENANCE,
            this.data.RETIRED
          ],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9e9e9e']
        }]
      };
    }
  }
}
