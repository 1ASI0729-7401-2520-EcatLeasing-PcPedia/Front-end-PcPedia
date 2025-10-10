import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-incident-create-dialog',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding:16px;">
      <h2 style="margin:0 0 4px 0;">Nuevo incidente</h2>
      <div style="opacity:.7; margin-bottom:16px;">
        Vista preliminar (front-only). Próximamente formulario.
      </div>
      <div class="skeleton" style="height:160px; border-radius:12px;"></div>

      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
        <button mat-button (click)="close()"><mat-icon>close</mat-icon>&nbsp;Cerrar</button>
        <button mat-raised-button color="primary" disabled>
          <mat-icon>save</mat-icon>&nbsp;Guardar (próx.)
        </button>
      </div>
    </div>
  `
})
export class IncidentCreateDialogComponent {
  constructor(private ref: MatDialogRef<IncidentCreateDialogComponent>) {}
  close() { this.ref.close(); }
}
