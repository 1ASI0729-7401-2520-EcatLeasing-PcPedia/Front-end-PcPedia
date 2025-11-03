import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../../domain/models/cart';

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly items = signal<CartItem[]>([]);

  add(item: CartItem) {
    const list = this.items();
    const idx = list.findIndex(x => x.deviceId === item.deviceId);
    if (idx >= 0) {
      // ya existe → acumula cantidad
      const updated = [...list];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
      this.items.set(updated);
    } else {
      this.items.set([...list, item]);
    }
  }

  remove(deviceId: string) {
    this.items.set(this.items().filter(i => i.deviceId !== deviceId));
  }

  clear() { this.items.set([]); }

  readonly total = computed(() =>
    this.items().reduce((acc, it) => acc + it.unitPrice * it.quantity, 0),
  );
}
