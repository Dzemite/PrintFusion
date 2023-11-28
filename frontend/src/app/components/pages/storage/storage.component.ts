import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, take } from 'rxjs';
import { StorageDialogComponent } from 'src/app/components/dialogs/storage-dialog/storage-dialog.component';
import { Storage, StorageAttributes } from 'src/app/interfaces/storage';
import { StoragesService } from 'src/app/services/storages/storages.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['ident', 'brand', 'type', 'color', 'weight', 'price'];
  storageList: Storage[] = [];
  dataSource!: MatTableDataSource<Storage, MatTableDataSourcePaginator>;

  private dialogRef!: MatDialogRef<StorageDialogComponent, StorageAttributes>;
  private editDialogRef!: MatDialogRef<StorageDialogComponent, { done: boolean }>;

  constructor(
    public storagesService: StoragesService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {
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
