// src/app/features/cart/cart.routes.ts
import { Routes } from '@angular/router';
import { CartComponent } from './cart';
import { PricingDomainService} from '../../domain/services/pricing.domain-service';

const routes: Routes = [
  {
    path: '',
    component: CartComponent,
    providers: [PricingDomainService],   // 👈 añade esto
  },
];

export default routes;
