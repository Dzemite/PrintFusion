import { Injectable, OnInit } from '@angular/core';
import { BrandsService } from './brands/brands.service';
import { ColorsService } from './colors/colors.service';
import { TypesService } from './types/types.service';
import { BehaviorSubject, catchError, of, take, zip } from 'rxjs';
import { Directory } from 'src/app/interfaces/directory';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';

/**
 * Не подходит для справочников с количеством элементов больше 100 так как страпи не выдает больше 100 элементов даже если у неё попросить.
 */
@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class DirectoriesService {

  brands$ = new BehaviorSubject<Directory[]>([]);
  colors$ = new BehaviorSubject<Directory[]>([]);
  types$ = new BehaviorSubject<Directory[]>([]);

  constructor(
    private brandsService: BrandsService,
    private colorsService: ColorsService,
    private typesService: TypesService,
    private toastr: ToastrService,
  ) {
    this.fetchAll();
  }

  fetchAll() {
    return zip([
      this.fetchBrands(),
      this.fetchColors(),
      this.fetchTypes(),
    ]).pipe(take(1), catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))).subscribe(res => {
      if (!res) return;

      this.brands$.next(res[0]?.data ?? []);
      this.colors$.next(res[1]?.data ?? []);
      this.types$.next(res[2]?.data ?? []);
    });
  }
  
  refetchBrands() {
    this.fetchBrands().pipe(take(1), catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))).subscribe(res => {
      this.brands$.next(res?.data ?? []);
    });
  }
  
  refetchColors() {
    this.fetchColors().pipe(take(1), catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))).subscribe(res => {
      this.colors$.next(res?.data ?? []);
    });
  }
  
  refetchTypes() {
    this.fetchTypes().pipe(take(1), catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))).subscribe(res => {
      this.types$.next(res?.data ?? []);
    });
  }

  private fetchBrands() {
    return this.brandsService.getBrands();
  }
  
  private fetchColors() {
    return this.colorsService.getColors();
  }
  
  private fetchTypes() {
    return this.typesService.getTypes();
  }
}
