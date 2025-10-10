import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IncidentsService } from '../../../../core/services/incidents.service';
import { Incident } from '../../../../core/models/incident.model';
import { AuthService } from '../../../../core/services/auth.service';
import { IncidentCreateDialogComponent } from './incident-create-dialog';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './incidents.html',
  styleUrls: ['./incidents.css']
})
export class IncidentsComponent implements OnInit {
  private incidentsSvc = inject(IncidentsService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  // ✅ propiedades simples para usar con ngModel
  query: string = '';
  modelFilter: string = 'Todos';

  isLoading = signal(true);
  incidents = signal<Incident[]>([]);
  models = signal<string[]>(['Todos']);

  // ✅ método que se recalcula siempre
  filtered(): Incident[] {
    const q = this.query.trim().toLowerCase();
    const mf = this.modelFilter.trim().toLowerCase();

    const list = this.incidents();
    return list.filter(i => {
      const modelo = (i.modelo ?? '').toLowerCase().trim();
      const code   = ((i.code ?? `INC-${i.id}`) as string).toLowerCase();
      const serie  = (i.serie ?? '').toLowerCase();
      const desc   = (i.descripcion ?? '').toLowerCase();

      const hitQ = !q || code.includes(q) || serie.includes(q) || desc.includes(q);
      const hitM = mf === 'todos' || modelo === mf;

      return hitQ && hitM;
    });
  }


  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.incidentsSvc.getByUsuario(user.id).subscribe({
      next: data => {
        this.incidents.set(data);
        const uniq = Array.from(new Set(data.map(x => x.modelo))).sort();
        this.models.set(['Todos', ...uniq]);
        this.isLoading.set(false);
      },
      error: _ => this.isLoading.set(false)
    });
  }

  newIncident() {
    this.dialog.open(IncidentCreateDialogComponent, {
      width: '560px',
      autoFocus: false,
      panelClass: 'app-surface'
    });
  }

  stateColor(state: Incident['estado']) {
    switch (state) {
      case 'Abierto': return 'warn';
      case 'En Proceso': return 'primary';
      default: return 'accent';
    }
  }

  // ✅ trackBy para evitar error TS2339
  trackById(index: number, item: any): number {
    return item.id;
  }
}
