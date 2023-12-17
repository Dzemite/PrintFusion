import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, filter, map, of, take, tap } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/helpers/error-state-matcher';
import { prepareWeightToForm, prepareWeightToServer } from 'src/app/helpers/preparations';
import { filterStoragesByResidueLimit } from 'src/app/helpers/storages';
import { InfinitAutocompleteItem } from 'src/app/interfaces/common';
import { OrderAttributes } from 'src/app/interfaces/order';
import { Storage } from 'src/app/interfaces/storage';
import { Settings } from 'src/app/interfaces/user';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { StoragesService } from 'src/app/services/storages/storages.service';
import { UserService } from 'src/app/services/user/user.service';

@UntilDestroy()
@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {

  prepareWeightToServer = prepareWeightToServer;
  prepareWeightToForm = prepareWeightToForm;

  storages: Storage[] = [];
  showPricePerPart = new FormControl(false);

  private _oldPrice = 0;
  get oldPrice(): string {
    return this._oldPrice.toFixed(2);
  }

  private _price = 0;
  get price(): string {
    return this._price.toFixed(2);
  }

  userSettings!: Settings | null | undefined;
  unit = '';

  orderForm = this.builder.group({
    name: this.builder.control('', Validators.required),
    itemCount: this.builder.control<number | null>(null, Validators.required),
    weight: this.builder.control<number | null>(null, Validators.required),
    plastic: this.builder.control<InfinitAutocompleteItem | null>(null, Validators.required),
    modelDesign: this.builder.control<number | null>(null),
    relatedExpenses: this.builder.control<number | null>(null),
 // date: this.builder.control('', Validators.required),
 // dateEnd: this.builder.control(''),
 // price: this.builder.control(''),
    pricePerPart: this.builder.control<number | null>(null),
    completed: this.builder.control(false),
    paid: this.builder.control(false),
  });

  matcher = new MyErrorStateMatcher();

  getPaginateStorages = ((filter: string, page: number, pageSize: number): Observable<InfinitAutocompleteItem[]> => {
    return this.storagesService.getStorages({
      filter: {
        name: 'extId',
        value: filter
      },
      page,
      pageSize,
      sort: ['id']
    }).pipe(
        map(storages => {
          return storages.data.map(storage => ({
            id: storage.id,
            name: storage.attributes.extId,
            price: storage.attributes.price,
            weight: prepareWeightToForm(storage.attributes.weight, this.userSettings?.units ?? 'kg'),
            residueLimit: prepareWeightToForm(storage.attributes.residueLimit, this.userSettings?.units ?? 'kg'),
            additional: [prepareWeightToForm(storage.attributes.weight, this.userSettings?.units ?? 'kg'), this.unit],
          }));
        })
      );
  }).bind(this);

  displayWith = ((item: InfinitAutocompleteItem) => {
    if (!item) return '';
    return item['weight'] ? `${item.name} —  Остаток: ${item['weight']} ${this.unit}` : item.name
  }).bind(this);

  hideOptionCondition = (option: InfinitAutocompleteItem) => {
    return option['residueLimit'] >= option['weight']
  }

  constructor(
    private builder: FormBuilder,
    private storagesService: StoragesService,
    private ordersService: OrdersService,
    private userService: UserService,
    private toastr: ToastrService,
    private dialogref: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userService.user$.pipe(
      untilDestroyed(this),
      filter(val => Boolean(val))
    ).subscribe(user => {
      this.userSettings = user?.settings;
      this.unit = this.userSettings?.units === 'kg' ?
        'кг.' :
        this.userSettings?.units === 'gr' ?
          'гр.' :
          'кг.';

      if (this.data?.edit) {
        const orderAttributes: OrderAttributes = data.orderData.attributes;
        this._oldPrice = orderAttributes.price;
        this._price = orderAttributes.price;
        this.orderForm.patchValue({
          ...orderAttributes,
          weight: this.prepareWeightToForm(orderAttributes.weight, this.userSettings?.units ?? 'kg'),
          plastic: {
            id: orderAttributes.plastic.data.id,
            name: orderAttributes.plastic.data.attributes.extId,
            price: orderAttributes.plastic.data.attributes.price,
          },
        });
        if (orderAttributes.pricePerPart) {
          this.showPricePerPart.patchValue(true);
          this.showPricePerPart.updateValueAndValidity();
        }
        this.orderForm.updateValueAndValidity();
      }
    });
  }

  ngOnInit() {
    this.storagesService.storages$
      .pipe(untilDestroyed(this))
      .subscribe(storages => {
        this.storages = storages;
      });
    this.orderForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.recalculateOrderPrice();
      });
      this.showPricePerPart.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
        if (value) {
          this.orderForm.controls.pricePerPart.clearValidators();
          this.orderForm.controls.pricePerPart.addValidators(Validators.required);
        } else {
          this.orderForm.controls.pricePerPart.clearValidators();
        }
        this.orderForm.controls.pricePerPart.updateValueAndValidity();
        this.recalculateOrderPrice();
      });
  }

  private recalculateOrderPrice() {
    const {itemCount, weight, plastic, modelDesign, relatedExpenses, pricePerPart} = this.orderForm.getRawValue();
    if (itemCount && weight && plastic && this.storages?.length) {
      const preparedWeight = this.prepareWeightToServer(weight, this.userSettings?.units ?? 'kg');
      const _pricePerPart = this.showPricePerPart.value ? pricePerPart : (preparedWeight * (plastic['price'] || 0));

      this._price = itemCount * (_pricePerPart || 0) + (modelDesign || 0) + (relatedExpenses || 0);
    }
  }

  createOrder() {
    if (!this.orderForm.valid) return;
    const formData = this.prepareOrderDataForServer();
    this.dialogref.close(formData);
  }

  saveOrder() {
    if (!this.orderForm.valid) return;
    const formData = this.prepareOrderDataForServer();
    this.ordersService.updateOrder({id: this.data.orderData.id, attributes: formData})
      .pipe(
        take(1),
        tap((res: any) => {
          if (res?.message && res?.name === 'ApplicationError') {
            this.toastr.error(res?.message);
          }
        }),
        catchError(err => {
          this.toastr.error(err?.error?.error?.message);

          return of(null);
        })
      )
      .subscribe(res => {
        if (res?.data?.id) {
          this.toastr.success('Success');
          this.dialogref.close({ done: true });
        };
      });
  }

  private prepareOrderDataForServer(): OrderAttributes {
    const orderValue = this.orderForm.getRawValue();
    const { pricePerPart } = orderValue;
    let pricePerPartForCreate = null;

    if (this.showPricePerPart.value) {
      pricePerPartForCreate = pricePerPart;
    }

    const formData: OrderAttributes = {
      ...(this.data?.orderData?.attributes || {}),
      ...orderValue,
      price: Number(this.price) || Number(this.oldPrice) || 0,
      pricePerPart: pricePerPartForCreate,
      weight: this.prepareWeightToServer(Number(orderValue.weight) || 0, this.userSettings?.units ?? 'kg'),
      plastic: orderValue.plastic?.id
    };

    return formData;
  }
}
