import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, catchError, of, take } from 'rxjs';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { User } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl!: string;

  user$ = new BehaviorSubject<User | null>(null);

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
    this.fetchUser();
  }

  fetchUser() {
    this.loading$.next(true);
    this.getUser()
      .pipe(
        take(1),
        catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))
      ).subscribe(res => {
        this.loading$.next(false);
        this.user$.next(res ?? null);
      });
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me?populate=settings`);
  }

  updateUser(user: Partial<User>) {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
  }
}
