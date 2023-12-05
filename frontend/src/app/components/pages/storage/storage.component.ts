import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, take } from 'rxjs';
import { StorageDialogComponent } from 'src/app/components/dialogs/storage-dialog/storage-dialog.component';
import { preparePriceToForm, prepareWeightToForm } from 'src/app/helpers/preparations';
import { Storage, StorageAttributes } from 'src/app/interfaces/storage';
import { Settings } from 'src/app/interfaces/user';
import { StoragesService } from 'src/app/services/storages/storages.service';
import { UserService } from 'src/app/services/user/user.service';

@UntilDestroy()
@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  prepareWeightToForm = prepareWeightToForm;
  preparePriceToForm = preparePriceToForm;

  displayedColumns: string[] = ['ident', 'brand', 'type', 'color', 'price', 'weight'];
  storageList: Storage[] = [];
  dataSource!: MatTableDataSource<Storage, MatTableDataSourcePaginator>;

  userSettings!: Settings | null | undefined;

  private dialogRef!: MatDialogRef<StorageDialogComponent, StorageAttributes>;
  private editDialogRef!: MatDialogRef<StorageDialogComponent, { done: boolean }>;

  constructor(
    public storagesService: StoragesService,
    private userService: UserService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.userService.user$.pipe(untilDestroyed(this)).subscribe(user => {
      this.userSettings = user?.settings;
    });
    this.storagesService.storages$.subscribe(storages => {
      this.storageList = storages;
      this.dataSource = new MatTableDataSource(this.storageList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  addStorage() {
    this.dialogRef = this.dialog.open(StorageDialogComponent);
    this.dialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (!res) {
        return;
      }
      this.storagesService.createStorage(res)
        .pipe(
          take(1),
          catchError(err => {
            this.toastr.error(err?.error?.error?.message);

            return of(null);
          })
        )
        .subscribe(res => {
          if (res?.extId) {
            this.storagesService.fetchStorages();
            this.toastr.success('Success');
          }
        });
    });
  }

  openEditStorageDialog(storageData: Storage) {
    this.editDialogRef = this.dialog.open(StorageDialogComponent, { data: { storageData, edit: true }});
    this.editDialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (res?.done) {
        this.storagesService.fetchStorages();
      }
    });
  }
}
