import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export class User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(environment.apiUrl + `users/authentication`, { email, password })
      .pipe(map((response: any) => {
        if (response.status) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
        return response;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentchildUser');
    localStorage.removeItem('currentparentUser');
    this.currentUserSubject.next(null);
  }
}
