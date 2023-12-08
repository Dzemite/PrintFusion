import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, filter, map, of, take } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/helpers/error-state-matcher';
import { preparePriceToForm, preparePriceToServer, prepareWeightToForm, prepareWeightToServer } from 'src/app/helpers/preparations';
import { InfinitAutocompleteItem } from 'src/app/interfaces/common';
import { StorageAttributes } from 'src/app/interfaces/storage';
import { Settings } from 'src/app/interfaces/user';
import { BrandsService } from 'src/app/services/directories/brands/brands.service';
import { DirectoriesService } from 'src/app/services/directories/directories.service';
import { StoragesService } from 'src/app/services/storages/storages.service';
import { UserService } from 'src/app/services/user/user.service';

@UntilDestroy()
@Component({
  selector: 'app-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss']
})
export class StorageDialogComponent implements OnInit {

  prepareWeightToServer = prepareWeightToServer;
  prepareWeightToForm = prepareWeightToForm;
  preparePriceToServer = preparePriceToServer;
  preparePriceToForm = preparePriceToForm;

  brands$ = this.directoriesService.brands$;
  types$ = this.directoriesService.types$;
  colors$ = this.directoriesService.colors$;

  userSettings!: Settings | null | undefined;

  storageForm = this.builder.group({
    extId: this.builder.control('', Validators.required),
    price: this.builder.control<number | null>(null, Validators.required),
    weight: this.builder.control<number | null>(null, Validators.required),
    residueLimit: this.builder.control(0, Validators.required),
    brand: new FormControl(),
    color: this.builder.control<number | null>(null),
    type: this.builder.control<number | null>(null),
  });

  matcher = new MyErrorStateMatcher();

  getPaginateBrands = ((filter: string, page: number, pageSize: number): Observable<InfinitAutocompleteItem[]> => {
    return this.brandsService.getBrands({
      filter: {
        name: 'name',
        value: filter
      },
      page,
      pageSize
    }).pipe(
        map(brands => {
          return brands.data.map(brand => ({
            id: brand.id,
            name: brand.attributes.name
          }));
        })
      );
  }).bind(this);

  constructor(
    private directoriesService: DirectoriesService,
    private brandsService: BrandsService,
    private storagesService: StoragesService,
    private userService: UserService,
    private toastr: ToastrService,
    private builder: FormBuilder,
    private dialogref: MatDialogRef<StorageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userService.user$.pipe(
      untilDestroyed(this),
      filter(val => Boolean(val))
    ).subscribe(user => {
      this.userSettings = user?.settings;

      if (data?.edit) {
        const storageAttributes: StorageAttributes = data.storageData.attributes;
        this.storageForm.patchValue({
          extId: storageAttributes.extId,
          price: this.preparePriceToForm(storageAttributes.price, this.userSettings?.units ?? 'kg'),
          weight: this.prepareWeightToForm(storageAttributes.weight, this.userSettings?.units ?? 'kg'),
          residueLimit: this.prepareWeightToForm(storageAttributes.residueLimit, this.userSettings?.units ?? 'kg'),
          brand: {
            id: storageAttributes.brand.data.id,
            name: storageAttributes.brand.data.attributes.name
          },
          color: storageAttributes.color.data.id,
          type: storageAttributes.type.data.id,
        });
        this.storageForm.updateValueAndValidity();
      }
    });
  }

  ngOnInit() {
    this.storageForm.valueChanges.subscribe((res) => {
      this.storageForm.markAsDirty();
    });
  }

  createStorage() {
    if (!this.storageForm.valid) return;

    const formData: StorageAttributes = this.prepareStorageToServer(this.storageForm.getRawValue() as any);
    this.dialogref.close(formData);
  }

  saveStorage() {
    if (!this.storageForm.valid) return;

    const formData: StorageAttributes = this.prepareStorageToServer(this.storageForm.getRawValue() as any);
    this.storagesService.updateStorage({id: this.data.storageData.id, attributes: formData})
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

  private prepareStorageToServer(storage: StorageAttributes) {
    return {
      ...storage,
      price: this.preparePriceToServer(storage.price || 0, this.userSettings?.units ?? 'kg'),
      weight: this.prepareWeightToServer(storage.weight || 0, this.userSettings?.units ?? 'kg'),
      residueLimit: this.prepareWeightToServer(storage.residueLimit || 0, this.userSettings?.units ?? 'kg'),
    };
  }
}
