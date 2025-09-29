import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const tokenKey = environment.auth?.tokenKey || 'auth_token';
    const token = localStorage.getItem(tokenKey);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'apikey': environment.supabase.anonKey,
      'Authorization': `Bearer ${environment.supabase.anonKey}`
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    const req$ = this.http.get<T>(`${environment.api.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params
    });
    return req$.pipe(
      timeout({ each: environment.api?.timeout ?? 30000 })
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const req$ = this.http.post<T>(`${environment.api.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
    return req$.pipe(
      timeout({ each: environment.api?.timeout ?? 30000 })
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const req$ = this.http.put<T>(`${environment.api.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
    return req$.pipe(
      timeout({ each: environment.api?.timeout ?? 30000 })
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    const req$ = this.http.delete<T>(`${environment.api.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
    return req$.pipe(
      timeout({ each: environment.api?.timeout ?? 30000 })
    );
  }

  uploadFile(endpoint: string, file: File, data?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    const req$ = this.http.post(`${environment.api.baseUrl}${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
    return req$.pipe(
      timeout({ each: environment.api?.timeout ?? 30000 })
    );
  }
}
