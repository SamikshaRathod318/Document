import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip adding token for auth requests
    if (request.url.includes('/auth/')) {
      return next.handle(request);
    }

    // Get token from local storage (use environment key for consistency)
    const tokenKey = environment.auth?.tokenKey || 'auth_token';
    const token = localStorage.getItem(tokenKey);
    
    // Clone the request and add the authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
