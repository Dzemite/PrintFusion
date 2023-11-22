import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { Storage, StorageAttributes, StorageData, StoragesData } from 'src/app/interfaces/storage';
import { BehaviorSubject, Observable, catchError, of, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class StoragesService {
  private apiUrl!: string;

  storages$ = new BehaviorSubject<Storage[]>([]);

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
    this.fetchStorages();
  }
  
  fetchStorages() {
    this.getStorages().pipe(take(1), catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))).subscribe(res => {
      this.storages$.next(res?.data ?? []);
    });
  }

  getStorages(): Observable<StoragesData> {
    return this.http.get<StoragesData>(`${this.apiUrl}/storages?populate=*`);
  }

  createStorage(storage: StorageAttributes) {
    return this.http.post<StorageAttributes>(`${this.apiUrl}/storages`, { data: storage });
  }
  
  updateStorage(storage: Storage) {
    return this.http.put<StorageData>(`${this.apiUrl}/storages/${storage.id}`, { data: storage.attributes });
  }
}
