import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/app/interfaces/environment';
import { EnvironmentService } from '../../environment/environment.service';
import { HttpClient } from '@angular/common/http';
import { DirectoriesData } from 'src/app/interfaces/directory';

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

  getColors(): Observable<DirectoriesData> {
    return this.http.get<DirectoriesData>(`${this.apiUrl}/colors?populate=*&pagination[pageSize]=200`);
  }

  createColor(name: string): Observable<DirectoriesData> {
    return this.http.post<DirectoriesData>(`${this.apiUrl}/colors`, {data: { name }});
  }
}
