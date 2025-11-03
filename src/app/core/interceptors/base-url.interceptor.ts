// src/app/core/interceptors/base-url.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // deja las absolutas
    if (/^https?:\/\//i.test(req.url)) return next.handle(req);

    // pega apiBase a cualquier otra
    const url = `${environment.apiBase}${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    return next.handle(req.clone({ url }));
  }
}
