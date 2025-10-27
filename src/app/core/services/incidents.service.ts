import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incident } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  
  private apiUrl = 'https://my-json-server.typicode.com/1ASI0729-7401-2520-EcatLeasing-PcPedia/Fake-Api/incidents';

  constructor(private http: HttpClient) {}
  
  getByUser(userId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}?userId=${userId}`);
  }
}
