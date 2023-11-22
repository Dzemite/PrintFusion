import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { AuthUser } from 'src/app/interfaces/user';

@UntilDestroy()
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(private builder: FormBuilder, private service: AuthService, private router: Router,
    private toastr: ToastrService) {

  }

  registerForm = this.builder.group({
    username: this.builder.control('', Validators.required),
    password: this.builder.control('', Validators.compose([Validators.required])), // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
  });

  proceedRegister() {
    if (this.registerForm.valid) {
      const registerUserData = this.registerForm.getRawValue();

      // TODO: rm any
      this.service.registerUser(registerUserData as any)
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
