import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorageComponent } from './pages/storage/storage.component';
import { AuthGuard } from './guards/auth-guard/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { OrdersComponent } from './pages/orders/orders.component';

const routes: Routes = [
 { component: LoginComponent, path: 'login' },
 { component: RegisterComponent, path: 'register' },
 { component: HomeComponent, path: '', canActivate:[AuthGuard] },
 { component: StorageComponent, path: 'storages', canActivate:[AuthGuard] },
 { component: OrdersComponent, path: 'orders', canActivate:[AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
