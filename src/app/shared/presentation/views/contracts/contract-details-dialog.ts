import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-details-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  template: `
    <h2 mat-dialog-title>{{ data.nombre }}</h2>
    <mat-dialog-content>
      <p><strong>Descripción:</strong> {{ data.descripcion }}</p>
      <p><strong>Equipos:</strong> {{ data.equipos }}</p>
      <p><strong>Inicio:</strong> {{ data.fechaInicio | date }}</p>
      <p><strong>Fin:</strong> {{ data.fechaFin | date }}</p>

      <h3>Modelos por tipo</h3>
      <div *ngFor="let detalle of data.detalles">
        <h4>{{ detalle.tipo }}</h4>
        <ul>
          <li *ngFor="let modelo of detalle.modelos">
            {{ modelo.nombre }} — <strong>{{ modelo.cantidad }}</strong> unidades
          </li>
        </ul>
      </div>
    </mat-dialog-content>
  `
})
export class ContractDetailsDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
