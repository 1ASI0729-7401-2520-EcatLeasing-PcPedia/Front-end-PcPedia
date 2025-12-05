import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private translate = inject(TranslateService);

  success(message: string, title?: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    Toast.fire({
      icon: 'success',
      title: title || this.translate.instant('messages.success'),
      text: message
    });
  }

  error(message: string, title?: string): void {
    Swal.fire({
      icon: 'error',
      title: title || this.translate.instant('messages.error'),
      text: message,
      confirmButtonColor: '#1A3458'
    });
  }

  warning(message: string, title?: string): void {
    Swal.fire({
      icon: 'warning',
      title: title || this.translate.instant('messages.warning'),
      text: message,
      confirmButtonColor: '#1A3458'
    });
  }

  info(message: string, title?: string): void {
    Swal.fire({
      icon: 'info',
      title: title || this.translate.instant('messages.info'),
      text: message,
      confirmButtonColor: '#1A3458'
    });
  }

  async confirm(message: string, title?: string): Promise<boolean> {
    const result: SweetAlertResult = await Swal.fire({
      icon: 'question',
      title: title || this.translate.instant('messages.confirm'),
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#1A3458',
      cancelButtonColor: '#6c757d',
      confirmButtonText: this.translate.instant('common.yes'),
      cancelButtonText: this.translate.instant('common.no')
    });

    return result.isConfirmed;
  }

  async confirmDelete(itemName: string): Promise<boolean> {
    const result: SweetAlertResult = await Swal.fire({
      icon: 'warning',
      title: this.translate.instant('messages.deleteConfirm'),
      text: `${this.translate.instant('messages.deleteMessage')} "${itemName}"?`,
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#6c757d',
      confirmButtonText: this.translate.instant('common.delete'),
      cancelButtonText: this.translate.instant('common.cancel')
    });

    return result.isConfirmed;
  }

  sessionExpired(): void {
    Swal.fire({
      icon: 'warning',
      title: this.translate.instant('auth.sessionExpired'),
      text: this.translate.instant('auth.sessionExpiredMessage'),
      confirmButtonColor: '#1A3458',
      allowOutsideClick: false
    });
  }
}
