import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartStore } from '../../core/state/cart.store';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';
import { CurrencyPerMonthPipe } from '../../shared/pipes/currency-per-month.pipe';

export interface CartItemView {
  deviceId: string;
  quantity: number;
  pricePerMonth: number;
  brand?: string;
  model?: string;
  imageUrl?: string;
  sku?: string;
}

@Component({
  standalone: true,
  selector: 'pc-cart',
  imports: [CommonModule, PageHeaderComponent, CurrencyPerMonthPipe],
  templateUrl: './cart.html',
})
export class CartComponent {
  private router = inject(Router);
  public cart = inject(CartStore); // público para el template si lo necesitas

  /**
   * Normalizamos los nombres de campos que usa la plantilla:
   * - unitPrice -> pricePerMonth
   * - qty -> quantity
   */
  items = () => {
    const rows = this.cart.items();
    return rows.map((it: any) => ({
      deviceId: it.deviceId ?? it.id,
      quantity: (it.quantity ?? it.qty ?? 1) as number,
      pricePerMonth: (it.pricePerMonth ?? it.unitPrice ?? 0) as number,
      brand: it.brand,
      model: it.model,
      imageUrl: it.imageUrl,
      sku: it.sku,
    })) as CartItemView[];
  };

  total = computed(() =>
    this.items().reduce((acc, r) => acc + r.quantity * r.pricePerMonth, 0)
  );

  lineTotal(it: CartItemView): number {
    return it.quantity * it.pricePerMonth;
  }

  /** Acepta item o id */
  inc(it: string | CartItemView) {
    const id = typeof it === 'string' ? it : it.deviceId;
    const current = this.items().find(x => x.deviceId === id);
    const nextQty = (current?.quantity ?? 1) + 1;

    // adapta al método real de tu store
    const s: any = this.cart as any;
    if (typeof s.updateQuantity === 'function') {
      s.updateQuantity(id, nextQty);
    } else if (typeof s.updateQty === 'function') {
      s.updateQty(id, nextQty);
    } else if (typeof s.setQty === 'function') {
      s.setQty(id, nextQty);
    }
  }

  dec(it: string | CartItemView) {
    const id = typeof it === 'string' ? it : it.deviceId;
    const current = this.items().find(x => x.deviceId === id);
    const nextQty = Math.max(1, (current?.quantity ?? 1) - 1);

    const s: any = this.cart as any;
    if (typeof s.updateQuantity === 'function') {
      s.updateQuantity(id, nextQty);
    } else if (typeof s.updateQty === 'function') {
      s.updateQty(id, nextQty);
    } else if (typeof s.setQty === 'function') {
      s.setQty(id, nextQty);
    }
  }

  remove(it: string | CartItemView) {
    const id = typeof it === 'string' ? it : it.deviceId;
    const s: any = this.cart as any;
    if (typeof s.remove === 'function') {
      s.remove(id);
    } else if (typeof s.removeByDeviceId === 'function') {
      s.removeByDeviceId(id);
    }
  }

  goCheckout() {
    this.router.navigate(['/orders/checkout']);
  }
}
