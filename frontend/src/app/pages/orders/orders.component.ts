import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, take } from 'rxjs';
import { OrderDialogComponent } from 'src/app/dialogs/order-dialog/order-dialog.component';
import { getDateFormated } from 'src/app/helpers/dates';
import { Order, OrderAttributes } from 'src/app/interfaces/order';
import { OrdersService } from 'src/app/services/orders/orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'itemCount', 'weight', 'plastic', 'date', 'dateEnd', 'price', 'completed', 'paid'];
  orderList: Order[] = [];
  dataSource!: MatTableDataSource<Order, MatTableDataSourcePaginator>;

  private dialogRef!: MatDialogRef<OrderDialogComponent, OrderAttributes>;
  private editDialogRef!: MatDialogRef<OrderDialogComponent, { done: boolean }>;

  getDateFormated = getDateFormated;

  constructor(
    private ordersService: OrdersService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {
    this.loadOrders();
  }

  addOrder() {
    this.dialogRef = this.dialog.open(OrderDialogComponent);
    this.dialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (!res) {
        return;
      }
      
      res.date = moment().toISOString();

      this.ordersService.createOrder(res)
        .pipe(
          take(1),
          catchError(err => {
            this.toastr.error(err?.error?.error?.message);

            return of(null);
          })
        )
        .subscribe(res => {
          if (res?.name) {
            this.loadOrders();
            this.toastr.success('Success');
          }
          if ((res as any)?.name === 'ValidationError') {
            this.toastr.error((res as any).message ?? 'ValidationError');
          }
        });
    });
  }

  loadOrders() {
    this.ordersService.getOrders().subscribe(res => {
      this.orderList = res.data;
      this.dataSource = new MatTableDataSource(this.orderList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openEditOrderDialog(orderData: Order) {
    this.editDialogRef = this.dialog.open(OrderDialogComponent, { data: { orderData, edit: true }});
    this.editDialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (res?.done) {
        this.loadOrders();
      }
    });
  }
}
