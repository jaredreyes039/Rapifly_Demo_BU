import { Component, OnInit, NgZone } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  sigup_submitted = false;

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"

  constructor(
    private toastr: ToastrService,
    public router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      title: ['', [Validators.required]],
      industries: ['', [Validators.required]],
      company_name: [''],
    });
  }

  get jval() {
    return this.signupForm.controls;
  }

  //On form submit function
  Signup() {
    this.sigup_submitted = true;
    if (this.signupForm.invalid) {
      return;
    } else {
      var data = this.signupForm.value;

      this.commonService.PostAPI(`${this.slug}coach/register`, data).then((response: any) => {
        if (response.status) {
          this.sigup_submitted = false;
          this.signupForm.reset();
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

}
