import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, take } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/helpers/error-state-matcher';
import { UserService } from 'src/app/services/user/user.service';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  userId!: number;

  units = [
    {
      id: 'kg',
      name: 'Килограммы'
    },
    {
      id: 'gr',
      name: 'Граммы'
    }
  ];

  userForm = this.builder.group({
    username: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.required),
    units: this.builder.control<'kg' | 'gr'>('kg', Validators.required),
  });

  constructor(
    public userService: UserService,
    private toastr: ToastrService,
    private builder: FormBuilder,
  ) { }

  ngOnInit() {
    this.userService.user$.pipe(untilDestroyed(this)).subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          units: user.settings?.units,
        });
        this.userForm.updateValueAndValidity();
      }
    });
  }

  matcher = new MyErrorStateMatcher();

  updateUser() {
    if (this.userForm.valid) {
      const userData = this.userForm.getRawValue();
      this.userService.loading$.next(true);
      this.userService.updateUser({
        id: this.userId,
        username: userData.username || '',
        email: userData.email || '',
        settings: { units: userData.units ?? 'kg' },
      }).pipe(
        take(1),
        catchError(err => {
          this.toastr.error(err?.error?.error?.message);

          return of(null);
        })
      ).subscribe(res => {
        if (res?.id) {
          this.toastr.success('Пользователь удачно обновлен');
          this.userService.fetchUser();
        }
      });
    }
  }

}
