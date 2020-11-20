import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from "../../services/common.service";

import { MustMatch } from '../../_Helpers/must-match.validator';



@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted: Boolean = false;
  currentUrl: String;
  isDisabled: Boolean = false;
  reset_token: String;

  userId: any = '';
  userToken: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private toastr: ToastrService,
    private commonService: CommonService,
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.currentUrl = window.location.href;

    this.route.params.subscribe(params => {
      if (params.id && params.token) {
        this.userId = params.id;
        this.userToken = params.token;
      } else {
        this.router.navigate(['/sign-in']);
      }
    });
  }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.isDisabled = true;
    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      this.isDisabled = false;
      return;
    } else {
      var data = {
        token: this.userToken,
        user_id: this.userId,
        password: this.f.password.value,
        confirm_password: this.f.confirmPassword.value,
      };

      this.commonService.PostAPI("users/update/reset-password", data).then((response: any) => {
        if (response.status) {
          this.toastr.success("Your password has been updated successfully.", "Success");
          this.router.navigateByUrl('/sign-in')
        } else {
          this.isDisabled = false;
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

}