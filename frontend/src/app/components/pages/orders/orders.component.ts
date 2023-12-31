import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, of, take } from 'rxjs';
import { OrderDialogComponent } from 'src/app/components/dialogs/order-dialog/order-dialog.component';
import { getDateFormated } from 'src/app/helpers/dates';
import { prepareWeightToForm } from 'src/app/helpers/preparations';
import { Order, OrderAttributes } from 'src/app/interfaces/order';
import { Settings } from 'src/app/interfaces/user';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { StoragesService } from 'src/app/services/storages/storages.service';
import { UserService } from 'src/app/services/user/user.service';

@UntilDestroy()
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
  
  userSettings!: Settings | null | undefined;

  getDateFormated = getDateFormated;
  prepareWeightToForm = prepareWeightToForm;

  constructor(
    public ordersService: OrdersService,
    private userService: UserService,
    public storagesService: StoragesService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.userService.user$.pipe(
      untilDestroyed(this),
      filter(val => Boolean(val))
    ).subscribe(user => {
      this.userSettings = user?.settings;
      this.ordersService.orders$.subscribe(orders => {
        this.orderList = orders;
        this.dataSource = new MatTableDataSource(this.orderList);
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }

  handlePageEvent(event: PageEvent) {
    console.log(event);
    this.ordersService.fetchOrders({
      pageSize: event.pageSize,
      page: event.pageIndex + 1,
      sort: ['id']
    });
    // this.length = e.length;
    // this.pageSize = e.pageSize;
    // this.pageIndex = e.pageIndex;

    /*
    [length]="length" // total items
    */
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
          if (res?.date) {
            this.ordersService.fetchOrders();
            this.storagesService.fetchStorages();
            this.toastr.success('Success');
          }
          if ((res as any)?.name === 'ValidationError') {
            this.toastr.error((res as any).message ?? 'ValidationError');
          }
        });
    });
  }

  openEditOrderDialog(orderData: Order) {
    this.editDialogRef = this.dialog.open(OrderDialogComponent, { data: { orderData, edit: true }});
    this.editDialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (res?.done) {
        this.ordersService.fetchOrders();
        this.storagesService.fetchStorages();
      }
    });
  }
}
