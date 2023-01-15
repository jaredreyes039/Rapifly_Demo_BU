import { OrganizationsComponent } from './../admin/organizations/organizations.component';
import { Component, OnInit } from '@angular/core';
import { CommonService } from "src/app/services/common.service";
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-invite-user',
  templateUrl: './register-invite-user.component.html',
  styleUrls: ['./register-invite-user.component.css']
})
export class RegisterInviteUserComponent implements OnInit {

  signup_submitted: boolean = false;
  signupForm: FormGroup;

  userRoles: any = [];

  invite_user_id: any;
  invite_user_details: any;  

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"

  constructor(
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.invite_user_id = params.id;
      } else {
        this.router.navigate(['/sign-in']);
      }
    });
  }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.getUserDetails();
    this.getRole("User");
  }

  getRole(role_name) {
    this.commonService.PostAPI(`${this.slug}role/get`, {role_name:role_name}).then((response: any) => {
      if (response && response.data) {
        this.userRoles = response.data;
      }
    });
  }

  getUserDetails() {
    this.commonService.PostAPI(`${this.slug}users/get/invite/user/details`, { id: this.invite_user_id }).then((response: any) => {
      if (response.status) {
        if (response.data) {
          if (response.data.has_registered == 1) {
            this.toastr.error("User has been already registered.", "Error");
            this.router.navigate(['/sign-in']);
          }

          this.invite_user_details = response.data;

          this.signupForm.setValue({
            first_name: '',
            last_name: '',
            email: this.invite_user_details.email,
            password: ''
          });
        } else {
          this.toastr.error("User details has not been found", "Error");
          this.router.navigate(['/sign-in']);
        }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  get jval() {
    return this.signupForm.controls;
  }

  submit() {
    this.signup_submitted = true;
    if (this.signupForm.invalid) {
      return;
    } else {
      var data = this.signupForm.value;
      data.invite_user_id = this.invite_user_id;
      data.organization_id = this.invite_user_details.organization_id;
      data.role_id = this.userRoles._id;
      data.parent_user_id = this.invite_user_details.parent_user_id;
      data.hierarchy_id = this.invite_user_details.hierarchy_id;

      this.commonService.PostAPI(`${this.slug}users/save`, data).then((response: any) => {
        if (response.status) {
          this.toastr.success("Your Registration  has been successfully.", "Success");
          this.router.navigate(['/sign-in']);
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }
}
