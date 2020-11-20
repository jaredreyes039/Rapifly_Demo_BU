import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    currentUser: any = [];

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        public toastr: ToastrService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.currentUser = this.authenticationService.currentUserValue;

        if (this.currentUser && this.currentUser.user) {
            // check if route is restricted by role
            if (route.data.roles && route.data.roles.indexOf(this.currentUser.role) === -1) {
                // role not authorised so redirect to home page
                if(this.currentUser.role == 'User'){
                    this.router.navigate(['/item-plans-details']);
                }else{
                    this.router.navigate(['/dashboard']);
                }
                // this.toastr.error("You do not have permission to access it.", "Permission Error")
                return false;
            }
            // authorised so return true
            return true;
        } else {
            // not logged in so redirect to login page with the return url
            this.authenticationService.logout();
            this.router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
            return false;
        }
    }
}