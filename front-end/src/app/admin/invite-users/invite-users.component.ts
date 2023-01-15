import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import { PlatformLocation } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-invite-users',
  templateUrl: './invite-users.component.html',
  styleUrls: ['./invite-users.component.css']
})
export class InviteUsersComponent implements OnInit {
  designations: any = [];

  inviteUserForm: FormGroup;
  isInviteUserFormValid = false;

  selectedDomain: any = '';

  currentuser;
  currentUrl;
  currentUserId;
  parent_user_id: any;

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"

  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private platformLocation: PlatformLocation
  ) {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    //Get base url
    this.currentUrl = (this.platformLocation as any).location.origin;
    this.currentUserId = this.currentuser.user._id;

    if (this.currentuser.role == "Admin") {
      this.parent_user_id = this.currentuser.user._id;
    } else {
      this.parent_user_id = this.currentuser.user.parent_user_id;
    }
  }

  ngOnInit() {
    this.inviteUserForm = this.formBuilder.group({
      hierarchy_id: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.getDesignations();
  }

  getDesignations() {
    if (this.currentuser.role == "Admin") {
      this.commonService.PostAPI(`${this.slug}hierarchy/get/designation`, { parent_user_id: this.parent_user_id }).then((response: any) => {
        if (response.status) {
          this.designations = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    } else {
      this.commonService.PostAPI(`${this.slug}hierarchy/get/child/designation`, { user_id: this.currentUserId }).then((response: any) => {
        if (response.status) {
          this.designations = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    }
  }

  //For validation
  get formVal() {
    return this.inviteUserForm.controls;
  }

  submit() {
    console.log(this.designations)
    this.isInviteUserFormValid = true;

    if (this.inviteUserForm.invalid) {
      return;
    } else {
      var data = this.inviteUserForm.value;

      data.current_url = this.currentUrl;
      data.invited_by_user_id = this.currentuser.user._id;
      data.parent_user_id = this.parent_user_id;

      this.commonService.PostAPI(`${this.slug}users/invite`, data).then((response: any) => {
        if (response.status) {
          this.inviteUserForm.reset();
          this.isInviteUserFormValid = false;
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

}
