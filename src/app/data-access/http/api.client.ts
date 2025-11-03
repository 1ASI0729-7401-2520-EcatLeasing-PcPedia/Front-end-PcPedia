import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // o environments

export type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);

  private url(path: string) {
    // si 'path' ya viene con http(s) lo respetamos; si no, usamos tal cual (normalmente ya viene con API_BASE desde Endpoints)
    return path;
  }

  list<T>(path: string, query?: Query, options: RequestOptions = {}): Observable<T> {
    const params = new HttpParams({
      fromObject: Object.fromEntries(
        Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== null)
      ) as any
    });
    return this.http.get<T>(this.url(path), { ...options, params });
  }

  get<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.url(path), options);
  }

  create<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body, options);
  }

  update<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.put<T>(this.url(path), body, options);
  }

  delete<T = void>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.delete<T>(this.url(path), options);
  }
  patch<T>(path: string, body: unknown, options: RequestOptions = {}) {
    return this.http.patch<T>(this.url(path), body, options);
  }


  // aliases
  post<T>(path: string, body: unknown, options: RequestOptions = {}) { return this.create<T>(path, body, options); }
  put<T>(path: string, body: unknown, options: RequestOptions = {}) { return this.update<T>(path, body, options); }
}
