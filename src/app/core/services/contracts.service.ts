import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private apiUrl = 'http://localhost:3000/contratos';

  constructor(private http: HttpClient) {}

  /** 🔹 Obtener todos los contratos */
  getAllContracts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /** 🔹 Obtener contratos por empresa */
  getContractsByEmpresa(empresaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  /** 🔹 Obtener contrato por ID (usando ?id= para compatibilidad con json-server) */
  getContractById(id: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?id=${id}`).pipe(
      map(result => result.length ? result[0] : null)
    );
  }

  /** 🔹 Buscar contrato por nombre o palabra clave */
  /** 🔹 Buscar contratos por nombre (filtrado manual en Angular) */
  searchContracts(query: string, empresaId: number): Observable<any[]> {
    return this.getContractsByEmpresa(empresaId).pipe(
      map(contracts =>
        contracts.filter(c =>
          c.nombre.toLowerCase().includes(query.toLowerCase()) ||
          c.descripcion.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

}
