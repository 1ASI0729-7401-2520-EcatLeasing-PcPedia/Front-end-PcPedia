import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsRepository, type Asset } from '../../data-access/repositories/assets.repository';
import { ContractsRepository, type Contract } from '../../data-access/repositories/contracts.repository';
import { PageHeaderComponent } from '../../shared/ui/page-header.component/page-header.component';

type BarDatum = { label: string; value: number };

@Component({
  standalone: true,
  selector: 'pc-dashboard',
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './dashboard.html',
  styles: [`
    .grid { display:grid; grid-template-columns: 1fr; gap:16px; }
    @media (min-width: 960px){ .grid { grid-template-columns: 1fr 1fr; } }
    .card { background:#fff; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .chart { width:100%; height:240px; }
    .table { width:100%; border-collapse: collapse; }
    .table th, .table td { padding:8px 10px; border-bottom:1px solid #eee; }
    .muted { color:#6b7280; }
    .h { font-size:14px; font-weight:600; margin-bottom:8px; }
    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; background:#eef2ff; }
  `]
})
export class DashboardPage {
  private assetsRepo = inject(AssetsRepository);
  private contractsRepo = inject(ContractsRepository);

  // TODO: reemplaza por el customerId del usuario logueado (AuthService)!
  private readonly customerId = 'cus_demo';

  readonly assets = signal<Asset[]>([]);
  readonly contracts = signal<Record<string, Contract>>({});

  ngOnInit() {
    this.assetsRepo.listByCustomer(this.customerId).subscribe(rows => this.assets.set(rows));
    this.contractsRepo.listByCustomer(this.customerId).subscribe(cs => {
      const map: Record<string, Contract> = {};
      cs.forEach(c => map[c.id] = c);
      this.contracts.set(map);
    });
  }

  // ------------- Aggregations para gráficos -------------
  readonly byBrand = computed<BarDatum[]>(() => {
    const acc = new Map<string, number>();
    for (const a of this.assets()) {
      acc.set(a.brand, (acc.get(a.brand) ?? 0) + 1);
    }
    return Array.from(acc.entries()).map(([label, value]) => ({ label, value }));
  });

  readonly byModel = computed<BarDatum[]>(() => {
    const acc = new Map<string, number>();
    for (const a of this.assets()) {
      acc.set(a.model, (acc.get(a.model) ?? 0) + 1);
    }
    return Array.from(acc.entries()).map(([label, value]) => ({ label, value }));
  });

  readonly byContract = computed<BarDatum[]>(() => {
    const contracts = this.contracts();
    const acc = new Map<string, number>();
    for (const a of this.assets()) {
      const name = contracts[a.contract_id]?.name ?? a.contract_id;
      acc.set(name, (acc.get(name) ?? 0) + 1);
    }
    return Array.from(acc.entries()).map(([label, value]) => ({ label, value }));
  });

  // ------------- Helpers de gráfico (SVG barras) -------------
  maxValue(data: BarDatum[]): number {
    return data.reduce((m, d) => Math.max(m, d.value), 0) || 1;
  }

  // ------------- VM Tabla -------------
  readonly tableRows = computed(() =>
    this.assets().map(a => ({
      contract: this.contracts()[a.contract_id]?.name ?? a.contract_id,
      partNumber: a.part_number,
      model: a.model,
      brand: a.brand,
      serial: a.serial_number,
      assignedTo: a.assigned_to_name,
      assignedAt: a.assigned_at
    }))
  );
}
