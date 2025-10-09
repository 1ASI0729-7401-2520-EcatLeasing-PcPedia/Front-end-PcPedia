import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContractsService } from '../../../../core/services/contracts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ContractDetailsDialog } from './contract-details-dialog';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatDialogModule],
  templateUrl: './contracts.html',
  styleUrls: ['./contracts.css']
})
export class Contracts implements OnInit {
  contratos: any[] = [];
  empresaId!: number;
  searchQuery = '';

  constructor(
    private contractsService: ContractsService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.empresaId = user.id;
      this.loadContracts();
    }
  }

  loadContracts(): void {
    this.contractsService.getContractsByEmpresa(this.empresaId)
      .subscribe({
        next: (data) => this.contratos = data,
        error: (err) => console.error('Error al cargar contratos:', err)
      });
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      this.loadContracts();
      return;
    }
    this.contractsService.searchContracts(query, this.empresaId)
      .subscribe({
        next: (data) => this.contratos = data,
        error: (err) => console.error('Error en búsqueda:', err)
      });
  }

  openDetails(id: number): void {
    this.contractsService.getContractById(id)
      .subscribe({
        next: (contract) => {
          this.dialog.open(ContractDetailsDialog, {
            width: '700px',
            data: contract
          });
        },
        error: (err) => console.error('Error al obtener contrato:', err)
      });
  }
}
