import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  RootPath: any = environment.apiUrl;

  constructor(
    public router: Router,
    public http: HttpClient
  ) { }

  GetAPI(path, data: any) {
    return new Promise((resolve, reject) => {
      this.http.get(this.RootPath + path, { params: data }).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }

  PostAPI(path, data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.RootPath + path, data).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }

  PutAPI(path, data) {
    return new Promise((resolve, reject) => {
      this.http.put(this.RootPath + path, data).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }

  PatchAPI(path, data) {
    return new Promise((resolve, reject) => {
      this.http.patch(this.RootPath + path, data).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }
}
