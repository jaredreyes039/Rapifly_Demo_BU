import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from "../../services/common.service";
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-forget-email',
  templateUrl: './forget-email.component.html',
  styleUrls: ['./forget-email.component.css']
})
export class ForgetEmailComponent implements OnInit {
  loginForm: FormGroup;
  submitted: Boolean = false;
  currentUrl: String;
  isDisabled: Boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private platformLocation: PlatformLocation
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }

    //Get base url
    this.currentUrl = (this.platformLocation as any).location.origin;
  }

  ngOnInit() {
    this.setForm();
    // console.log(this.currentUrl);
  }

  setForm() {
    this.submitted = false;
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.isDisabled = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      this.isDisabled = false;
      return;
    } else {
      this.commonService.PostAPI(`users/reset-password`, { email: this.f.email.value, clientUrl: this.currentUrl }).then((response: any) => {
        if (response.status) {
          this.toastr.success("Reset password link has been sent on your email address.", "Success");
          this.setForm();
          setTimeout(() => this.isDisabled = false, 7000);
        } else {
          this.isDisabled = false;
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

}