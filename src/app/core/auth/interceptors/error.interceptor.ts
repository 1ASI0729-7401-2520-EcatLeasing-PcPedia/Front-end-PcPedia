import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { StorageService } from '../../services/storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Lazy injection to avoid circular dependency
      const notification = injector.get(NotificationService);
      let errorMessage = 'An error occurred';

      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          notification.error(errorMessage, 'Error de conexión');
          break;

        case 401:
          storage.clear();
          notification.sessionExpired();
          router.navigate(['/login']);
          break;

        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          notification.error(errorMessage, 'Acceso denegado');
          break;

        case 404:
          errorMessage = error.error?.message || 'Recurso no encontrado.';
          break;

        case 400:
          errorMessage = error.error?.message || 'Datos inválidos.';
          break;

        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          notification.error(errorMessage, 'Error del servidor');
          break;

        default:
          errorMessage = error.error?.message || 'Ha ocurrido un error inesperado.';
      }

      return throwError(() => ({ ...error, message: errorMessage }));
    })
  );
};
