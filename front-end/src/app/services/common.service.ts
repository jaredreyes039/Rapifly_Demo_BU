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

  // public getLatLngFromAddress(address: string) {
  //   var geocoder: any = new google.maps.Geocoder();

  //   return new Promise((resolve, reject) => {
  //     geocoder.geocode({ 'address': address }, function (results, status) {
  //       if (status == google.maps.GeocoderStatus.OK) {
  //         var latitude = results[0].geometry.location.lat();
  //         var longitude = results[0].geometry.location.lng();

  //         resolve({
  //           latitude: latitude,
  //           longitude: longitude
  //         });
  //       } else {
  //         reject({ message: "no results found" });
  //       }
  //     });
  //   });
  // }

  // public getLatLngFromMultiAddress(details) {
  //   return new Promise((resolve, reject) => {
  //     var locations: any = [];

  //     details.forEach(function (element) {
  //       var last_seen_at = '';

  //       if (element.last_seen_at_street_address) {
  //         last_seen_at += element.last_seen_at_street_address + ', ';
  //       }

  //       if (element.last_seen_at_city_name) {
  //         last_seen_at += element.last_seen_at_city_name + ', ';
  //       }

  //       if (element.last_seen_at_state_name) {
  //         last_seen_at += element.last_seen_at_state_name + ', ';
  //       }

  //       var geocoder: any = new google.maps.Geocoder();
  //       geocoder.geocode({ 'address': last_seen_at }, function (results, status) {
  //         if (status == google.maps.GeocoderStatus.OK) {
  //           var latitude = results[0].geometry.location.lat();
  //           var longitude = results[0].geometry.location.lng();

  //           locations.push({
  //             latitude: latitude,
  //             longitude: longitude,
  //             name_of_subject: element.name_of_subject
  //           });
  //         }
  //       });
  //     });

  //     console.log(locations)
  //   });
  // }
}
