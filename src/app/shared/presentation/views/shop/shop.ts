import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShopService } from '../../../../core/services/shop.service';
import { ProductDetailsDialog } from './product-details-dialog';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatCardModule, MatDialogModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class Shop implements OnInit {
  productos: any[] = [];

  constructor(private shopService: ShopService, private dialog: MatDialog) {}

  ngOnInit() {
    this.shopService.getProductos().subscribe(data => this.productos = data);
  }

  openDetails(id: number) {
    this.shopService.getProductoById(id).subscribe(producto => {
      this.dialog.open(ProductDetailsDialog, {
        width: '600px',
        data: producto
      });
    });
  }
}
