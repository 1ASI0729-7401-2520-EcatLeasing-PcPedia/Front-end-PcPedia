import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OrdersRepository} from '../../data-access/repositories';// ajusta path si difiere
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip';

type OrderItem = {
  device_id?: string;
  deviceId?: string;
  quantity: number;
  price_per_month?: number;
  pricePerMonth?: number;
};

type OrderRow = {
  id: string;
  status: 'created' | 'approved' | 'in_transit' | 'delivered' | 'cancelled';
  created_at?: string;
  createdAt?: string;
  currency?: string;
  items: OrderItem[];
  notes?: string;
};

type ChipVariant = 'open' | 'in_progress' | 'closed' | 'scheduled' | 'done' | 'low' | 'medium' | 'high';

@Component({
  standalone: true,
  selector: 'pc-orders-list',
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent, StatusChipComponent],
  templateUrl: './orders.html',
})
export class OrdersListPage {
  private repo = inject(OrdersRepository);

  // 👇 evita colisión con animations.query: NO uses el nombre "query"
  readonly searchText = signal<string>('');
  readonly state = signal<string>(''); // '', 'created', 'approved', ...

  readonly orders = signal<OrderRow[]>([]);
  readonly loading = signal<boolean>(false);

  ngOnInit() {
    this.loading.set(true);
    this.repo.listByCustomer('cus_demo').subscribe({
      next: (rows: any[]) => {
        // tipado flexible a OrderRow
        this.orders.set(rows as OrderRow[]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Lista ya filtrada para el template */
  readonly filtered = computed(() => {
    const q = (this.searchText() ?? '').trim().toLowerCase();
    const st = (this.state() ?? '').trim();

    return this.orders().filter(o => {
      const okStatus = !st || o.status === st;
      if (!okStatus) return false;

      if (!q) return true;

      // campos para búsqueda
      const id = o.id?.toLowerCase() ?? '';
      const status = o.status?.toLowerCase() ?? '';
      const notes = o.notes?.toLowerCase() ?? '';
      const itemsTxt = (o.items || [])
        .map(it =>
          `${it.device_id ?? it.deviceId ?? ''} ${it.price_per_month ?? it.pricePerMonth ?? ''}`
        )
        .join(' ')
        .toLowerCase();

      return (
        id.includes(q) ||
        status.includes(q) ||
        notes.includes(q) ||
        itemsTxt.includes(q)
      );
    });
  });

  /** Mapea status de orden -> variante de chip soportada */
  chipVariant(s: OrderRow['status']): ChipVariant {
    switch (s) {
      case 'created':     return 'open';
      case 'approved':    return 'scheduled';
      case 'in_transit':  return 'in_progress';
      case 'delivered':    return 'done';
      case 'cancelled':   return 'closed';
      default:            return 'open';
    }
  }

  /** Total mensual aproximado para una orden (sumatoria de items) */
  monthly(o: OrderRow): number {
    return (o.items || []).reduce((acc, it) => {
      const p = (it.pricePerMonth ?? it.price_per_month ?? 0) as number;
      const q = (it.quantity ?? 0) as number;
      return acc + p * q;
    }, 0);
  }

  // Handlers para (ngModelChange)
  setSearch(val: string) { this.searchText.set(val ?? ''); }
  setState(val: string)  { this.state.set(val ?? ''); }
}
