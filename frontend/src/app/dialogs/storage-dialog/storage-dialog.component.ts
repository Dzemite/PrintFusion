import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, take } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/helpers/error-state-matcher';
import { StorageAttributes } from 'src/app/interfaces/storage';
import { DirectoriesService } from 'src/app/services/directories/directories.service';
import { StoragesService } from 'src/app/services/storages/storages.service';

@Component({
  selector: 'app-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss']
})
export class StorageDialogComponent implements OnInit {

  brands$ = this.directoriesService.brands$;
  types$ = this.directoriesService.types$;
  colors$ = this.directoriesService.colors$;

  storageForm = this.builder.group({
    extId: this.builder.control('', Validators.required),
    price: this.builder.control<number | null>(null, Validators.required),
    weight: this.builder.control<number | null>(null, Validators.required),
    brand: this.builder.control<number | null>(null),
    color: this.builder.control<number | null>(null),
    type: this.builder.control<number | null>(null),
  });

  matcher = new MyErrorStateMatcher();

  constructor(
    private directoriesService: DirectoriesService,
    private storagesService: StoragesService,
    private toastr: ToastrService,
    private builder: FormBuilder,
    private dialogref: MatDialogRef<StorageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.edit) {
      const storageAttributes: StorageAttributes = data.storageData.attributes;
      this.storageForm.patchValue({
        ...storageAttributes,
        brand: storageAttributes.brand.data.id,
        color: storageAttributes.color.data.id,
        type: storageAttributes.type.data.id,
      });
      this.storageForm.updateValueAndValidity();
    }
  }

  ngOnInit() {
  }

  createStorage() {
    if (!this.storageForm.valid) return;

    const formData = this.storageForm.getRawValue();
    this.dialogref.close(formData);
  }

  saveStorage() {
    if (!this.storageForm.valid) return;

    const formData: StorageAttributes = this.storageForm.getRawValue() as any;
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
}
