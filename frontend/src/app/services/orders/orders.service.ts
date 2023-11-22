import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { ENV } from 'src/app/interfaces/environment';
import { Observable } from 'rxjs';
import { Order, OrderAttributes, OrderData, OrdersData } from 'src/app/interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl!: string;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
  ) {
    this.apiUrl = this.env.getValue(ENV.API_URL);
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
