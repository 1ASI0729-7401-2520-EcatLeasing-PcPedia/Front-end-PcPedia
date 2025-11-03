import { Component, inject, signal, computed } from '@angular/core';
import { DevicesRepository} from '../../data-access/repositories';
import { Device } from '../../domain/models/device';
import { CartStore } from '../../core/state/cart.store';
import {CurrencyPerMonthPipe} from '../../shared/pipes/currency-per-month.pipe';
import {NgForOf, TitleCasePipe} from '@angular/common';
import {PageHeaderComponent} from '../../shared/ui/page-header.component/page-header.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css'],
  imports: [
    CurrencyPerMonthPipe,
    PageHeaderComponent,
    TitleCasePipe,
    NgForOf
  ]
})
export class CatalogComponent {
  private repo = inject(DevicesRepository);
  private cart = inject(CartStore);

  readonly devices = signal<Device[]>([]);
  readonly loading = signal<boolean>(false);

  ngOnInit() {
    this.loading.set(true);
    this.repo.list().subscribe({
      next: (rows) => this.devices.set(rows),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  addToCart(d: Device) {
    this.cart.add({
      deviceId: d.id,
      sku: d.sku,                                   // ahora existe
      name: `${d.brand} ${d.model}`,
      unitPrice: d.pricePerMonth,
      quantity: 1,
      imageUrl: d.imageUrl,
    });
  }
}
