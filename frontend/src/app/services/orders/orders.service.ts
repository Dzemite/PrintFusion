import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { BehaviorSubject, Observable, catchError, of, take } from 'rxjs';
import { Order, OrderAttributes, OrderData, OrdersData } from 'src/app/interfaces/order';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl!: string;

  orders$ = new BehaviorSubject<Order[]>([]);  

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading$.next(true);
    this.getOrders()
      .pipe(
        take(1),
        catchError(err => this.toastr.error(err?.error?.error?.message) && of(null))
      ).subscribe(res => {
        this.loading$.next(false);
        this.orders$.next(res?.data ?? []);
      });
  }

  getOrders(): Observable<OrdersData> {
    return this.http.get<OrdersData>(`${this.apiUrl}/orders?populate=*`);
  }

  createOrder(storage: OrderAttributes) {
    return this.http.post<OrderAttributes>(`${this.apiUrl}/orders`, { data: storage });
  }

  updateOrder(order: Order) {
    return this.http.put<OrderData>(`${this.apiUrl}/orders/${order.id}`, { data: order.attributes });
  }
}
