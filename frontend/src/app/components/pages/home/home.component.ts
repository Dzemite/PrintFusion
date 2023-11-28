import { Component } from '@angular/core';
import { catchError, of, take } from 'rxjs';
import { Directory } from 'src/app/interfaces/directory';
import { BrandsService } from 'src/app/services/directories/brands/brands.service';
import { ColorsService } from 'src/app/services/directories/colors/colors.service';
import { TypesService } from 'src/app/services/directories/types/types.service';

const types = [
  'ABS',
  'ABS+',
  'ASA',
  'FLEX',
  'HIPS',
  'Nylon',
  'PCL',
  'PETG',
  'PLA',
  'PLA+',
  'POM',
  'PVA',
  'SBS',
  'SLA',
  'TPU',
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(
    private brandsService: BrandsService,
    private colorsService: ColorsService,
    private typesService: TypesService,
  ) {}

  // createBrand() {
  //   this.loading = true;
  //   brands.forEach((brand, index) => {
  //     setTimeout(() => {
  //       this.brandsService.createBrand(brand).pipe(
  //         take(1),
  //         catchError(err => {
  //           console.error(err);
  //           return of(null);
  //         })
  //       ).subscribe(res => {
  //         console.log(`${brand} created, id = ${(res?.data as any).id}`);
  //       });
  //     }, 200);
  //   });
  // }

  create() {
    types.forEach((type, index) => {
      setTimeout(() => {
        this.typesService.createType(type).pipe(
          take(1),
          catchError(err => {
            console.error(err);
            return of(null);
          })
        ).subscribe(res => {
          console.log(`${type} created, id = ${(res?.data as any).id}`);
        });
      }, 200);
    });
  }
}
