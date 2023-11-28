import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../../../services/auth/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { AuthUser } from 'src/app/interfaces/user';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(
    private builder: FormBuilder,
    private toastr: ToastrService,
    private service: AuthService,
    private router: Router,
  ) {
      sessionStorage.clear();
      localStorage.clear();
  }

  loginform = this.builder.group({
    identifier: this.builder.control('', Validators.required),
    password: this.builder.control('', Validators.required)
  });

  proceedlogin() {
    if (this.loginform.valid) {
      this.service.logIn(this.loginform.value.identifier || '', this.loginform.value.password || '')
        .pipe(
          untilDestroyed(this),
          catchError(err => {
            this.toastr.error(err?.error?.error?.message);

            return of(err);
          })
        )
        .subscribe((userData: AuthUser) => {
          // TODO: remove it
          sessionStorage.setItem('username', String(userData.user.username));
          sessionStorage.setItem('role', 'admin');

          localStorage.setItem('jwt', userData.jwt);
          localStorage.setItem('user', JSON.stringify(userData.user));
          this.router.navigate(['']);
        });
    } else {
      this.toastr.warning('Please enter valid data.')
    }
  }
}
