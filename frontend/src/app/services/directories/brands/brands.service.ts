import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/app/interfaces/environment';
import { EnvironmentService } from '../../environment/environment.service';
import { HttpClient } from '@angular/common/http';
import { DirectoriesData } from 'src/app/interfaces/directory';
import { RequestOptions } from 'src/app/interfaces/common';
import { prepareRequestOptions } from 'src/app/helpers/requests';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private apiUrl!: string;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
  }

  getBrands(options: RequestOptions = {}): Observable<DirectoriesData> {
    const preparedOptions = prepareRequestOptions(options);
    return this.http.get<DirectoriesData>(`${this.apiUrl}/brands?populate=*${preparedOptions ? '&' + preparedOptions : ''}`);
  }

  createBrand(name: string): Observable<DirectoriesData> {
    return this.http.post<DirectoriesData>(`${this.apiUrl}/brands`, {data: { name }});
  }
}
