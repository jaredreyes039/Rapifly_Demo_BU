import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';
import { MustMatch } from '../_Helpers/must-match.validator';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  editProfileForm: FormGroup;
  editProfileSubmitted: boolean = false;

  changePasswordForm: FormGroup;
  changePasswordSubmitted: boolean = false;

  currentuser;
  currentUserId;
  userProfile: any = [];

  avatarUrl: any = "";
  userDesignation: any;

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"


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
    this.editProfileForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      new_password: [''],
      confirm_password: [''],
    }, {
      validator: MustMatch('new_password', 'confirm_password')
    });

    this.changePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', [Validators.required]],
    }, {
      validator: MustMatch('new_password', 'confirm_password')
    });
    this.getUserProfileDetails();
  }

  getUserProfileDetails() {
    this.commonService.PostAPI(`${this.slug}users/profile`, { user_id: this.currentUserId, }).then((response: any) => {
      if (response.status) {
        this.userProfile = response.data;
        if (!response.data.passwordChanged) {
          this.toastr.error("Please change your password and complete profile", 'Error')
        }
        this.avatarUrl = response.avatar_url;
        this.userDesignation = response.designation;
        this.editProfileForm.setValue({
          first_name: this.userProfile.first_name,
          last_name: this.userProfile.last_name,
          email: this.userProfile.email,
          password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  get fval() {
    return this.editProfileForm.controls;
  }

  get pval() {
    return this.changePasswordForm.controls;
  }

  updateProfile() {
    this.editProfileSubmitted = true;
    if (this.editProfileForm.invalid) {
      return;
    }

    var data = this.editProfileForm.value;
    data.id = this.currentUserId;

    this.commonService.PostAPI(`${this.slug}users/profile/update`, data).then((response: any) => {
      if (response.status) {
        if (data.password && data.new_password) {
          var changePasswordData = {
            new_password: data.new_password,
            password: data.password,
            user_id: this.currentUserId
          };
          this.commonService.PostAPI(`${this.slug}users/password/update`, changePasswordData).then((response: any) => {
            if (response.status) {
              this.toastr.success("Profile has been changed successfully.", "Success");
              this.currentuser.user.passwordChanged = true
              localStorage.setItem('currentUser', JSON.stringify(this.currentuser));
              this.getUserProfileDetails();
            } else {
              this.toastr.error(response.message, "Error");
            }
          });
        } else {
          this.getUserProfileDetails();
        }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  openModal() {
    $("#myModal").modal("show");
  }

  closeModal() {
    $("#myModal").modal("hide");
  }

  changePassword() {
    this.changePasswordSubmitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    var data = this.changePasswordForm.value;
    data.user_id = this.currentUserId;

    this.commonService.PostAPI(`${this.slug}users/password/update`, data).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.closeModal();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {

      var formData = new FormData();
      formData.append('avatar', fileInput.target.files[0]);
      formData.append('user_id', this.currentUserId);

      this.commonService.PostAPI(`${this.slug}users/avatar/update`, formData).then((response: any) => {
        if (response.status) {
          this.getUserProfileDetails();
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }
}
