import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaintenanceRepository} from '../../data-access/repositories';
import { MaintenanceRequest} from '../../domain/models';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {PageHeaderComponent} from '../../shared/ui/page-header.component/page-header.component';

@Component({
  standalone: true,
  selector: 'pc-maintenance',
  imports: [CommonModule, RouterLink, MatButtonModule, MatChipsModule, MatIconModule, PageHeaderComponent],
  templateUrl: './maintenance.html',
  styleUrls: ['./maintenance.css'],
})
export class MaintenancePage {
  private repo = inject(MaintenanceRepository);
  // en un auth real, obtén el customerId del token; por ahora demo:
  private readonly customerId = 'cus_demo';

  readonly items = signal<MaintenanceRequest[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit() {
    this.repo.listByCustomer(this.customerId).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  colorFor(status: MaintenanceRequest['status']) {
    return {
      open: 'warn',
      in_progress: 'accent',
      done: 'primary',
      closed: '',
    }[status] ?? '';
  }
}
