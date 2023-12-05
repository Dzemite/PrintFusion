import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { AuthUser, RegisterUserData } from 'src/app/interfaces/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl!: string;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
  }

  logIn(identifier: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/auth/local`, {identifier, password});
  }

  registerUser(inputdata: RegisterUserData) {
    return this.http.post(`${this.apiUrl}/auth/local/register`, inputdata);
  }

  /** Old functions */
  
  isLoggedIn() {
    return sessionStorage.getItem('username')!=null;
  }
}
