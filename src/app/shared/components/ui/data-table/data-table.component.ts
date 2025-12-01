import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    TranslateModule,
    EmptyStateComponent
  ],
  template: `
    @if (loading) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    @if (!loading && dataSource.data.length === 0) {
      <app-empty-state
        [icon]="emptyIcon"
        [title]="emptyTitle"
        [message]="emptyMessage">
      </app-empty-state>
    } @else {
      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)">
          <ng-content></ng-content>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.clickable]="rowClickable"
              (click)="onRowClick(row)">
          </tr>
        </table>
      </div>

      <mat-paginator
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        [pageSizeOptions]="pageSizeOptions"
        [showFirstLastButtons]="true"
        (page)="onPageChange($event)">
      </mat-paginator>
    }
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    tr.clickable {
      cursor: pointer;
    }

    tr.clickable:hover {
      background: #f5f5f5;
    }

    mat-paginator {
      background: transparent;
    }
  `]
})
export class DataTableComponent<T> implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() set data(value: T[]) {
    this.dataSource.data = value;
  }

  @Input() displayedColumns: string[] = [];
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50];
  @Input() loading = false;
  @Input() rowClickable = false;
  @Input() emptyIcon = 'inbox';
  @Input() emptyTitle = '';
  @Input() emptyMessage = '';

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() rowClick = new EventEmitter<T>();

  dataSource = new MatTableDataSource<T>([]);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }
}
