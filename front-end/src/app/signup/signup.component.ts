import { Component, OnInit, NgZone } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from "../services/common.service";
import { AuthenticationService } from 'src/app/services/authentication.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  sigup_submitted = false;
  chart: any;

  userRoles: any = [];

  constructor(
    private toastr: ToastrService,
    public router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private commonService: CommonService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.verifyform();
  }

  //Get role of user, if invite user then it's role is user and if not then it's role is admin.
  getRole(role_name) {
    this.commonService.PostAPI('role/get', { role_name: role_name }).then((response: any) => {
      if (response && response.data) {
        this.userRoles = response.data;
      }
    });
  }

  //Check if user is invite or not.
  checkUser(email) {
    this.commonService.PostAPI('users/check/user', { email: email }).then((response: any) => {
      console.log("checkUser -> response", response)
      console.log(this.userRoles);
      
      var role_name = "";
      if (response && response.data && response.data.length > 0) {
        role_name = "User";
      } else {
        role_name = "Admin";
      }
      console.log("checkUser -> role_name", role_name)

      this.getRole(role_name);
    });
  }

  get jval() {
    return this.signupForm.controls;
  }

  //Form validation
  verifyform() {
    this.signupForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  //On form submit function
  Signup(form) {
    this.sigup_submitted = true;
    if (this.signupForm.invalid) {
      return;
    } else {
      var data = this.signupForm.value;
      data.role_id = this.userRoles._id;

      this.commonService.PostAPI('users/create', data).then((response: any) => {
        if (response.status) {
          this.toastr.success("You account has been created successfully..", "Success");
          this.router.navigate(['/sign-in']);
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

}
