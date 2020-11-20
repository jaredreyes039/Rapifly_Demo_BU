import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { MustMatch } from '../_Helpers/must-match.validator';

declare var $: any;

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  addsettingForm: FormGroup;
  addtimeoutSubmitted: boolean = false;

  currentuser;
  currentUserId;
  userProfile: any = [];

  avatarUrl: any = "";

  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) {
    this.currentuser = this.authenticationService.currentUserValue;
    this.currentUserId = this.currentuser.user._id;
  }

  ngOnInit() {
    this.addsettingForm = this.formBuilder.group({
      delegationtimeout : ['', Validators.required]
    });

    // this.changePasswordForm = this.formBuilder.group({
    //   password: ['', Validators.required],
    //   new_password: ['', Validators.required],
    //   confirm_password: ['', [Validators.required]],
    // }, {
    //   validator: MustMatch('new_password', 'confirm_password')
    // });

    //this.getUserProfileDetails();
  }

  getUserProfileDetails() {
   
  }

  get fval() {
    return this.addsettingForm.controls;
  }

  
  updateProfile() {
    this.addtimeoutSubmitted = true;
    if (this.addsettingForm.invalid) {
      console.log(this.addsettingForm);
      
      return;
    }

    var data = this.addsettingForm.value;
    data.user_id = this.currentUserId;

    this.commonService.PostAPI('users/save/delegationtimeout', data).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        //this.getUserProfileDetails();
      } else {
        //this.getUserProfileDetails();
        this.toastr.error(response.message, "Error");
      }
    });
  }



}
