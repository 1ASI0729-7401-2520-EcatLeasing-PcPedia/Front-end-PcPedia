import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentDTO} from '../../dto';

@Injectable({ providedIn: 'root' })
export class PaymentsHttp {
  private http = inject(HttpClient);
  private readonly base = '/api/payments';

  create(dto: Omit<PaymentDTO, 'id'>) {
    return this.http.post<PaymentDTO>(this.base, dto);
  }

  listByOrder(orderId: string) {
    return this.http.get<PaymentDTO[]>(`${this.base}?order_id=${orderId}`);
  }
}
