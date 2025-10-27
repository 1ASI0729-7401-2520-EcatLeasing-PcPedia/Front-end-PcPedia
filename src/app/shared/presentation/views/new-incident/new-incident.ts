import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { IncidentsService } from '../../../../core/services/incidents.service';
import { Incident } from '../../../../core/models/incident.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-incident',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './new-incident.html',
  styleUrls: ['./new-incident.css']
})
export class NewIncident {
  model = '';
  serial = '';
  description = '';

  constructor(
    private dialogRef: MatDialogRef<NewIncident>,
    private http: HttpClient,
    private authService: AuthService) {}

  saveIncident() {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('⚠️ No hay usuario logueado');
      return;
    }

    this.http.get<any[]>('https://my-json-server.typicode.com/1ASI0729-7401-2520-EcatLeasing-PcPedia/Fake-Api/incidents').subscribe(incidents => {
      const newIncident = {
        id: 101 + incidents.length,
        userId: currentUser.id,
        model: this.model,
        serial: this.serial,
        date: new Date().toISOString().split('T')[0],
        state: 'Abierto',
        description: this.description
      };

      this.http.post('https://my-json-server.typicode.com/1ASI0729-7401-2520-EcatLeasing-PcPedia/Fake-Api/incidents', newIncident).subscribe(() => {
        console.log('✅ Incidente registrado correctamente:', newIncident);
      });
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}
