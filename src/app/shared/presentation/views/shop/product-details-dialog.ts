import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>{{ data.nombre }}</h2>
    <img [src]="data.imagen" style="width: 100%; border-radius: 8px;">
    <p>{{ data.descripcion }}</p>
    <p><strong>Procesador:</strong> {{ data.procesador }}</p>
    <p><strong>Memoria:</strong> {{ data.memoria }}</p>
    <p><strong>Almacenamiento:</strong> {{ data.almacenamiento }}</p>
    <p><strong>Precio:</strong> S/. {{ data.precio }}</p>
    <p><strong>Stock disponible:</strong> {{ data.stock }}</p>
    <button (click)="close()">Cerrar</button>
  `
})
export class ProductDetailsDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProductDetailsDialog>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
