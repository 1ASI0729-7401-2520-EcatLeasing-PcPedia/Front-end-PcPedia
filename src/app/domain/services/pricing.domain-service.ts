// src/app/domain/services/pricing.domain-service.ts
import { Injectable } from '@angular/core';
import { CartItem, Cart } from '../models/cart';      // ✅ importa desde ../models/cart
import { Order, OrderItem } from '../models/order';

export interface PricingRules {
  taxRate?: number;                  // 0.18 => 18%
  currency?: string;                 // "PEN" | "USD"
  tierDiscounts?: Array<{ minQty: number; percent: number }>; // percent en 0..1
  cartDiscountPercent?: number;      // 0..1
  couponPercent?: number;            // 0..1
}

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable({ providedIn: 'root' })
export class PricingDomainService {
  private rules: PricingRules = {};

  constructor() {}

  /** Permite configurar reglas en runtime (opcional). */
  configure(rules: Partial<PricingRules>) {
    this.rules = { ...this.rules, ...rules };
  }

  /** Precio mensual del ítem aplicando descuento por cantidad. */
  itemMonthly(item: CartItem | OrderItem): number {
    // Soporta camelCase y snake_case (price_per_month) por si llega directo del API/db.json
    const qtyRaw = (item as any).quantity;
    const qty = Math.max(1, typeof qtyRaw === 'number' ? qtyRaw : 1);

    const price =
      (item as any).pricePerMonth ??
      (item as any)['price_per_month'] ??
      0;

    const base = qty * price;
    const d = this.discountForQty(qty); // 0..1
    return round2(base * (1 - d));
  }

  /** Descuento por tramos según cantidad (0..1). */
  discountForQty(qty: number): number {
    const tiers = [...(this.rules.tierDiscounts ?? [])].sort((a, b) => a.minQty - b.minQty);
    let pct = 0;
    for (const t of tiers) if (qty >= t.minQty) pct = t.percent;
    // clamp defensivo
    return Math.min(Math.max(pct || 0, 0), 1);
  }

  /** Totales del carrito con descuentos globales y tax. */
  totalsForCart(items: CartItem[], opts?: { couponApplied?: boolean }) {
    const sub = round2(items.reduce((acc, it) => acc + this.itemMonthly(it), 0));
    const cartDisc = this.rules.cartDiscountPercent ?? 0;
    const coupon = opts?.couponApplied ? (this.rules.couponPercent ?? 0) : 0;

    const afterDisc = round2(sub * (1 - cartDisc) * (1 - coupon));
    const tax = round2(afterDisc * (this.rules.taxRate ?? 0));
    const total = round2(afterDisc + tax);

    return {
      currency: this.rules.currency ?? 'PEN',
      subtotalPerMonth: sub,
      discountsPerMonth: round2(sub - afterDisc),
      taxPerMonth: tax,
      totalPerMonth: total,
    };
  }

  /** Totales de una orden (sin cupón salvo que ya venga aplicado en items). */
  totalsForOrder(order: Order) {
    const items = order.items.map<OrderItem>(i => ({ ...i }));
    const sub = round2(items.reduce((acc, it) => acc + this.itemMonthly(it), 0));
    const tax = round2(sub * (this.rules.taxRate ?? 0));
    const total = round2(sub + tax);
    return {
      currency: this.rules.currency ?? 'PEN',
      subtotalPerMonth: sub,
      taxPerMonth: tax,
      totalPerMonth: total,
    };
  }

  /** Prorrateo del mes entre fechas (ambas inclusive). */
  prorationForMonth(fullMonthly: number, start: Date, end: Date): number {
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const used = (end.getDate() - start.getDate()) + 1;
    return round2(fullMonthly * (used / daysInMonth));
  }

  /** Devuelve el cart con totales recalculados. */
  hydrateCart(cart: Cart, opts?: { couponApplied?: boolean }): Cart {
    const t = this.totalsForCart(cart.items, opts);
    return {
      ...cart,
      subtotalPerMonth: t.subtotalPerMonth,
      discountsPerMonth: t.discountsPerMonth,
      totalPerMonth: t.totalPerMonth,
      updatedAt: new Date(),
    };
  }
}
