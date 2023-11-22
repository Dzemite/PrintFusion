import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, take } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/helpers/error-state-matcher';
import { OrderAttributes } from 'src/app/interfaces/order';
import { Storage } from 'src/app/interfaces/storage';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { StoragesService } from 'src/app/services/storages/storages.service';

@UntilDestroy()
@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {

  storages: Storage[] = [];

  private _oldPrice = 0;
  get oldPrice(): string {
    return this._oldPrice.toFixed(2);
  }

  private _price = 0;
  get price(): string {
    return this._price.toFixed(2);
  }

  orderForm = this.builder.group({
    name: this.builder.control('', Validators.required),
    itemCount: this.builder.control<number | null>(null, Validators.required),
    weight: this.builder.control<number | null>(null, Validators.required),
    plastic: this.builder.control<number | null>(null, Validators.required),
    modelDesign: this.builder.control<number | null>(null),
    relatedExpenses: this.builder.control<number | null>(null),
 // date: this.builder.control('', Validators.required),
 // dateEnd: this.builder.control(''),
 // price: this.builder.control(''),
    completed: this.builder.control(false),
    paid: this.builder.control(false),
  });

  matcher = new MyErrorStateMatcher();

  constructor(
    private builder: FormBuilder,
    private storagesService: StoragesService,
    private ordersService: OrdersService,
    private toastr: ToastrService,
    private dialogref: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.edit) {
      const orderAttributes: OrderAttributes = data.orderData.attributes;
      this._oldPrice = orderAttributes.price;
      this._price = orderAttributes.price;
      this.orderForm.patchValue({
        ...orderAttributes,
        plastic: orderAttributes.plastic.data.id,
      });
      this.orderForm.updateValueAndValidity();
    }
  }

  ngOnInit() {
    this.storagesService.storages$
      .pipe(untilDestroyed(this))
      .subscribe(storages => {
        this.storages = storages;
      });
    this.orderForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(({itemCount, weight, plastic, modelDesign, relatedExpenses}) => {
        if (itemCount && weight && plastic && this.storages?.length) {
          const plasticData = this.storages.find(storage => storage.id === plastic)?.attributes;
          if (!plasticData) {
            this.toastr.info('Cant find plastic in storage.');
            this._price = 0;
            return;
          }
          if (!plasticData?.price) {
            this.toastr.info('Зlastic has no price per kg.');
            this._price = 0;
            return;
          }
          this._price = itemCount * ( weight * plasticData?.price ) + (modelDesign ?? 0) + (relatedExpenses ?? 0);
        }
      });
  }

  createOrder() {
    if (!this.orderForm.valid) return;
    
    const formData = {
      ...this.orderForm.getRawValue(),
      price: Number(this.price) ?? 0,
    };
    this.dialogref.close(formData);
  }

  saveOrder() {
    if (!this.orderForm.valid) return;

    const formData: OrderAttributes = {
      ...this.data.orderData.attributes,
      ...this.orderForm.getRawValue(),
      price: Number(this.price) || Number(this.oldPrice) || 0,
    };
    this.ordersService.updateOrder({id: this.data.orderData.id, attributes: formData})
      .pipe(
        take(1),
        catchError(err => {
          this.toastr.error(err?.error?.error?.message);

          return of(null);
        })
      )
      .subscribe(res => {
        if (res?.data?.id) {
          this.toastr.success('Success');
          this.dialogref.close({ done: true });
        }
      });
  }
}
