import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { Storage, StorageAttributes, StorageData, StoragesData } from 'src/app/interfaces/storage';
import { BehaviorSubject, Observable, catchError, of, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Meta, RequestOptions } from 'src/app/interfaces/common';
import { prepareRequestOptions } from 'src/app/helpers/requests';

@Injectable({
  providedIn: 'root'
})
export class StoragesService {
  private apiUrl!: string;

  storages$ = new BehaviorSubject<Storage[]>([]);
  metadata$ = new BehaviorSubject<Meta | null>(null);
  
  loading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
    this.fetchStorages();
  }
  
  fetchStorages(options: RequestOptions = {page: 1, pageSize: 10, sort: ['id']}) {
    this.loading$.next(true);
    this.getStorages(options)
      .pipe(
        take(1),
        catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))
      ).subscribe(res => {
        this.loading$.next(false);
        this.storages$.next(res?.data ?? []);
        this.metadata$.next(res?.meta ?? null);
      });
  }

  getStorages(options: RequestOptions = {}): Observable<StoragesData> {
    const preparedOptions = prepareRequestOptions(options);
    return this.http.get<StoragesData>(`${this.apiUrl}/storages?populate=*${preparedOptions ? '&' + preparedOptions : ''}`);
  }

  createStorage(storage: StorageAttributes) {
    return this.http.post<StorageAttributes>(`${this.apiUrl}/storages`, { data: storage });
  }
  
  updateStorage(storage: Storage) {
    return this.http.put<StorageData>(`${this.apiUrl}/storages/${storage.id}`, { data: storage.attributes });
  }
}
