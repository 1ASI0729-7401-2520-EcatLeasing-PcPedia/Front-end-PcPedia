import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incident } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  // Si tienes environment
  // private apiUrl = `${environment.apiBase}/incidents`;


  private apiUrl = 'https://my-json-server.typicode.com/1ASI0729-7401-2520-EcatLeasing-PcPedia/Fake-Api/incidents';

  constructor(private http: HttpClient) {}

  /** 🔹 Obtener todos los incidentes por empresa */
  getByEmpresa(empresaId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  /** 🔹 Obtener todos los incidentes por usuario */
  getByUsuario(usuarioId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  /** 🔹 Obtener incidente por ID (útil para futuros detalles o edición) */
  getById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Crear un nuevo incidente (para cuando implementes el POST real) */
  create(incident: Omit<Incident, 'id' | 'code'>): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident);
  }

  /** 🔹 Eliminar incidente (opcional) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
