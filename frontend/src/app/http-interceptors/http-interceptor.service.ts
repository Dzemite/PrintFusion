import { HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    // const authToken = this.auth.getAuthorizationToken();

    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    // const authReq = req.clone({
    //   headers: req.headers.set('Authorization', authToken)
    // });

    const token = localStorage.getItem('jwt');

    const headersObject: { [name: string]: string | string[]; } = { 'Content-Type': 'application/json' };
    if (token) {
      headersObject['Authorization'] = `Bearer ${token ?? ''}`;
    }

    const headers: HttpHeaders = new HttpHeaders(headersObject);

    const clonedReq = req.clone({
      headers
    });
    
    // send cloned request with header to the next handler.
    return next.handle(clonedReq);
  }
}
