import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/app/interfaces/environment';
import { EnvironmentService } from '../../environment/environment.service';
import { HttpClient } from '@angular/common/http';
import { DirectoriesData } from 'src/app/interfaces/directory';
import { prepareRequestOptions } from 'src/app/helpers/requests';
import { RequestOptions } from 'src/app/interfaces/common';

@Injectable({
  providedIn: 'root'
})
export class ColorsService {
  private apiUrl!: string;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
  }

  getColors(options: RequestOptions = { pageSize: 100 }): Observable<DirectoriesData> {
    const preparedOptions = prepareRequestOptions(options);
    return this.http.get<DirectoriesData>(`${this.apiUrl}/colors?populate=*${preparedOptions ? '&' + preparedOptions : ''}`);
  }

  createColor(name: string): Observable<DirectoriesData> {
    return this.http.post<DirectoriesData>(`${this.apiUrl}/colors`, {data: { name }});
  }
}
