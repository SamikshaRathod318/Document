import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          localStorage.removeItem('auth_token');
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: this.router.url } 
          });
        } else if (error.status === 403) {
          // Forbidden - redirect to unauthorized page
          this.router.navigate(['/unauthorized']);
        }
        
        // Log the error
        console.error('HTTP Error:', error);
        
        // Return the error to the service that initiated the request
        return throwError(() => error);
      })
    );
  }
}
