import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { UserModel } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getUsers(): Observable<UserModel[]> {
    return this.api.get<UserModel[]>(environment.api.endpoints.users);
  }

  getUserById(userId: number): Observable<UserModel> {
    return this.api.get<UserModel>(`${environment.api.endpoints.users}/${userId}`);
  }
}


