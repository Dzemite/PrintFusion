import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterComponent } from './components/pages/register/register.component';
import { LoginComponent } from './components/pages/login/login.component';
import { HomeComponent } from './components/pages/home/home.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'src/app/material.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { StorageComponent } from './components/pages/storage/storage.component';
import { ENVIRONMENT } from './services/environment/environment.service';
import { environment } from 'src/environment/environment';
import { HttpInterceptorService } from './http-interceptors/http-interceptor.service';
import { StorageDialogComponent } from './components/dialogs/storage-dialog/storage-dialog.component';
import { OrdersComponent } from './components/pages/orders/orders.component';
import { OrderDialogComponent } from './components/dialogs/order-dialog/order-dialog.component';
import { LoaderComponent } from './components/common/loader/loader.component';
import { ProfileComponent } from './components/pages/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    LoaderComponent,
    StorageComponent,
    OrdersComponent,
    StorageDialogComponent,
    OrderDialogComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule,
    ToastrModule.forRoot()
  ],
  providers: [
    { 
      provide: ENVIRONMENT,
      useValue: environment
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
