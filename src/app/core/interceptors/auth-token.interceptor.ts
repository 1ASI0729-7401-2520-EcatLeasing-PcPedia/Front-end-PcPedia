import { Injectable, inject } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStore } from '../state/session.store';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private session = inject(SessionStore);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.session.token();
    if (!token) return next.handle(req);

    const authed = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(authed);
  }
}
