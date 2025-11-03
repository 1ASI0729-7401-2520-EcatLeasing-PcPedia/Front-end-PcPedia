// src/app/domain/services/cart.domain-service.ts
import { Injectable } from '@angular/core';
import { PricingDomainService, PricingRules } from './pricing.domain-service';
import { Cart } from '../models/cart';

@Injectable({ providedIn: 'root' })
export class CartDomainService {
  constructor(private pricing: PricingDomainService) {}

  /** Si necesitas reglas dinámicas, pásalas aquí antes de calcular. */
  setPricingRules(rules?: Partial<PricingRules>) {
    if (rules) this.pricing.configure(rules);
  }

  hydrateCart(cart: Cart, opts?: { couponApplied?: boolean }) {
    return this.pricing.hydrateCart(cart, opts);
  }

  // ...cualquier otro método que llamaba a this.pricing.*
}
