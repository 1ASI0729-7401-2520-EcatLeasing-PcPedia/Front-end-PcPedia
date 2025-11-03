import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { OrdersRepository } from '../../data-access/repositories/order.repository';
import { DevicesRepository } from '../../data-access/repositories/device.repository';
import { OrderDomainService } from '../../domain/services/order.domain-service';

import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip';
import { TimelineComponent, TimelineItem } from '../../shared/ui/timeline/timeline';

import type { Order } from '../../domain/models/order';
import type { Device } from '../../domain/models';

type ChipVariant =
  | 'open' | 'in_progress' | 'closed' | 'scheduled' | 'done'
  | 'low' | 'medium' | 'high';

@Component({
  standalone: true,
  selector: 'pc-order-detail',
  imports: [CommonModule, RouterModule, PageHeaderComponent, StatusChipComponent, TimelineComponent],
  templateUrl: './order-detail.html',
})
export class OrderDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordersRepo = inject(OrdersRepository);
  private devicesRepo = inject(DevicesRepository);
  private domain = inject(OrderDomainService);

  readonly order = signal<Order | null>(null);
  private devicesById = signal<Record<string, Device>>({});

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ordersRepo.getById(id).subscribe((o) => {
      this.order.set(o);
      const ids = Array.from(new Set(o.items.map(i => i.deviceId)));
      if (!ids.length) { this.devicesById.set({}); return; }
      this.devicesRepo.getManyByIds(ids).subscribe(devs => {
        const map: Record<string, Device> = {};
        for (const d of devs) map[d.id] = d;
        this.devicesById.set(map);
      });
    });
  }

  itemName(deviceId: string): string {
    const d = this.devicesById()[deviceId];
    return d ? `${d.brand} ${d.model}` : deviceId;
  }

  monthly(o: Order): number {
    return (o.items ?? []).reduce((acc, it) => acc + (it.pricePerMonth ?? 0) * it.quantity, 0);
  }

  chipVariant(s: Order['status']): ChipVariant {
    switch (s) {
      case 'created':    return 'open';
      case 'approved':   return 'scheduled';
      case 'in_transit': return 'in_progress';
      case 'delivered':  return 'done';
      case 'cancelled':  return 'closed';
      default:           return 'open';
    }
  }

  readonly timeline = computed<TimelineItem[]>(() => {
    const o = this.order();
    if (!o) return [];
    const created = new Date(o.createdAt);
    const steps: TimelineItem[] = [
      { date: created, title: 'Pedido creado', description: 'Se generó el pedido en el sistema', tone: 'neutral' },
    ];
    if (o.status === 'approved' || o.status === 'in_transit' || o.status === 'delivered') {
      steps.push({ date: created, title: 'Aprobado', description: 'Pedido aprobado', tone: 'ok' });
    }
    if (o.status === 'in_transit' || o.status === 'delivered') {
      steps.push({ date: created, title: 'En tránsito', description: 'Envío en camino', tone: 'info' });
    }
    if (o.status === 'delivered') {
      steps.push({ date: created, title: 'Entregado', description: 'Equipo entregado al cliente', tone: 'ok' });
    }
    if (o.status === 'cancelled') {
      steps.push({ date: created, title: 'Cancelado', description: 'Pedido cancelado', tone: 'error' });
    }
    return steps;
  });

  // Botón Eliminar pedido (borra orden + pagos)
  async deleteOrder() {
    const o = this.order();
    if (!o) return;
    const ok = confirm(`¿Eliminar pedido #${o.id}? Se eliminarán sus pagos asociados.`);
    if (!ok) return;
    await this.domain.deleteOrderAndPayments(o.id);
    this.router.navigate(['/orders']);
  }

  // Botón Descargar recibo (reusa la función que ya tenías si existe en el TS o crea aquí)
  downloadReceiptFromPayment(p: { id: string; invoiceNumber?: string; amount: number; currency: string; status: string; paidAt?: string; }) {
    const o = this.order();
    if (!o) return;
    const lines = (o.items ?? []).map(it => {
      const name = this.itemName(it.deviceId);
      const price = (it.pricePerMonth ?? 0).toFixed(2);
      const sub = ((it.pricePerMonth ?? 0) * it.quantity).toFixed(2);
      return `<tr><td>${name}</td><td style="text-align:right">${price}</td><td style="text-align:right">${it.quantity}</td><td style="text-align:right">${sub}</td></tr>`;
    }).join('');
    const total = this.monthly(o).toFixed(2);
    const html = `
<!doctype html><html><head><meta charset="utf-8"><title>Recibo ${p.invoiceNumber ?? p.id}</title>
<style>
body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;}
h1{font-size:20px;margin:0 0 8px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th,td{border-bottom:1px solid #eee;padding:6px}
th{background:#f8f8f8;text-align:left}
.right{text-align:right}
</style></head><body>
<h1>Recibo #${p.invoiceNumber ?? p.id}</h1>
<div>Pedido: ${o.id} • Estado: ${p.status}</div>
<div>Fecha: ${new Date().toLocaleString()}</div>
<div>Moneda: ${o.currency}</div>
<table>
  <thead><tr><th>Ítem</th><th class="right">Precio/mes</th><th class="right">Cant.</th><th class="right">Subtotal</th></tr></thead>
  <tbody>${lines}</tbody>
  <tfoot><tr><th colspan="3" class="right">Total mensual</th><th class="right">${total}</th></tr></tfoot>
</table>
<p><strong>Total del pago:</strong> ${p.amount.toFixed(2)} ${p.currency}</p>
${p.paidAt ? `<p>Pagado: ${new Date(p.paidAt).toLocaleString()}</p>` : ''}
</body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  }
}
