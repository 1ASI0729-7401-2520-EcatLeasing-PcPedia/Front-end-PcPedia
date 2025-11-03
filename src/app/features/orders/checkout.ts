import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../core/state/cart.store';
import { DevicesRepository } from '../../data-access/repositories/device.repository';
import { OrderDomainService } from '../../domain/services/order.domain-service';
import { firstValueFrom } from 'rxjs';

import type { Device } from '../../domain/models';
import type { Order } from '../../domain/models/order';

type CheckoutRow = {
  device: Device | null;
  quantity: number;
  subtotal: number;
};

@Component({
  standalone: true,
  selector: 'pc-checkout',
  imports: [CommonModule],
  templateUrl: './checkout.html',
})
export class CheckoutPage {
  private cart = inject(CartStore);
  private devicesRepo = inject(DevicesRepository);
  private domain = inject(OrderDomainService);
  private router = inject(Router);

  private devicesById = signal<Record<string, Device>>({});

  async ngOnInit() {
    const ids = Array.from(new Set(this.cart.items().map(it => it.deviceId)));
    if (!ids.length) return;
    const devs = await firstValueFrom(this.devicesRepo.getManyByIds(ids));
    const map: Record<string, Device> = {};
    for (const d of devs) map[d.id] = d;
    this.devicesById.set(map);
  }

  readonly rows = computed<CheckoutRow[]>(() => {
    const map = this.devicesById();
    return this.cart.items().map(it => {
      const dev = map[it.deviceId] ?? null;
      const price = dev?.pricePerMonth ?? 0;
      return { device: dev, quantity: it.quantity, subtotal: price * it.quantity };
    });
  });

  readonly total = computed(() => this.rows().reduce((acc, r) => acc + r.subtotal, 0));

  async pay() {
    const map = this.devicesById();
    const itemsForOrder = this.cart.items().map(it => ({
      deviceId: it.deviceId,
      quantity: it.quantity,
      pricePerMonth: map[it.deviceId]?.pricePerMonth ?? 0,
    }));

    // Tipar como dominio para que status/currency/ítems cuadren
    const draft: Omit<Order, 'id' | 'createdAt'> = {
      customerId: 'cus_demo',
      status: 'created',      // union literal de dominio
      currency: 'PEN',
      items: itemsForOrder,
      notes: 'Creado desde Checkout',
      contact: { name: 'Sebastián', email: 'sebastian@pcpedia.local' },
      billing: { ruc: '20123456789', address: 'Av. Javier Prado 123' },
    };

    await this.domain.createFromCheckout(draft);
    this.cart.clear();
    this.router.navigate(['/orders']);
  }
}
