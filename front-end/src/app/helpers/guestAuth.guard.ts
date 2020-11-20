import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class GuestAuthGuard implements CanActivate {
    currentUser: any = [];

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        public toastr: ToastrService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.currentUser = this.authenticationService.currentUserValue;

        if (this.currentUser && this.currentUser.user) {
            this.router.navigate(['/dashboard']);
            return false;
        } else {
            return true;
        }
    }
}