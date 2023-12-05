import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorageComponent } from './components/pages/storage/storage.component';
import { AuthGuard } from './guards/auth-guard/auth.guard';
import { HomeComponent } from './components/pages/home/home.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { OrdersComponent } from './components/pages/orders/orders.component';
import { ProfileComponent } from './components/pages/profile/profile.component';

const routes: Routes = [
 { component: LoginComponent, path: 'login' },
 { component: RegisterComponent, path: 'register' },
 { component: HomeComponent, path: '', canActivate:[AuthGuard] },
 { component: StorageComponent, path: 'storages', canActivate:[AuthGuard] },
 { component: OrdersComponent, path: 'orders', canActivate:[AuthGuard] },
 { component: ProfileComponent, path: 'profile', canActivate:[AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
