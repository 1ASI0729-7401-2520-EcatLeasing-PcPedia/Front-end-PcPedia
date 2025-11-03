import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReturnRepository } from '../../data-access/repositories/return.repository';

@Component({
  standalone: true,
  selector: 'app-returns',
  imports: [CommonModule],
  templateUrl: './returns.html',
  styleUrls: ['./returns.css']
})
export class ReturnsComponent implements OnInit {
  readonly rows = signal<any[]>([]);
  constructor(private repo: ReturnRepository) {}
  ngOnInit() { this.repo.listByCustomer('customer-1').subscribe(r => this.rows.set(r)); }
}
