import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { AuthUser } from 'src/app/interfaces/user';
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

  registerUser(inputdata: any) {
    return this.http.post(this.apiUrl,inputdata)
  }

  getAll() {
    return this.http.get(this.apiUrl);
  }

  updateUser(id: any,inputdata: any){
    return this.http.put(this.apiUrl+'/'+id,inputdata);
  }

  getuserrole() {
    return this.http.get('http://localhost:3000/role');
  }

  isLoggedIn() {
    return sessionStorage.getItem('username')!=null;
  }

  getRole() {
    return sessionStorage.getItem('role')!=null?sessionStorage.getItem('role')?.toString():'';
  }

  getAllCustomer() {
    return this.http.get('http://localhost:3000/customer');
  }

  getAccessByRole(role: any, menu: any){
    return this.http.get('http://localhost:3000/roleaccess?role='+role+'&menu='+menu)
  }
}
