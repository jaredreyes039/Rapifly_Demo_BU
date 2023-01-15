import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: 'app-add-user-groups',
  templateUrl: './add-user-groups.component.html',
  styleUrls: ['./add-user-groups.component.css']
})
export class AddUserGroupsComponent implements OnInit {

  currentuser;
  currentUrl;
  currentUserId;
  parent_user_id: any = "";
  hierarchy_id: any = "";

  addUserGroupForm: FormGroup;
  isAddUserGroupFormValid = false;

  items = [];
  selected = [];

  userGroupId: any = '';

  label: any = '';
  buttonLabel: any = '';

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
  ) {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    this.currentUserId = this.currentuser.user._id;

    if (this.currentuser.role == "Admin") {
      this.parent_user_id = this.currentuser.user._id;
    } else {
      this.parent_user_id = this.currentuser.user.parent_user_id;
    }
  }

  ngOnInit() {
    this.addUserGroupForm = this.formBuilder.group({
      group_name: ['', Validators.required],
      description: ['', Validators.required],
      group_members: [''],
    });

    this.getHierarchyUsers();

    if (this.route.snapshot.params && this.route.snapshot.params.id) {
      this.userGroupId = this.route.snapshot.params.id;
      this.getUserGroupById(this.userGroupId);
      this.label = "Edit";
      this.buttonLabel = "Update";
    } else {
      this.label = "Add";
      this.buttonLabel = "Save";
    }
  }

  getUserGroupById(id) {
    this.commonService.PostAPI(`${this.slug}user_group/get/by/id`, { id: id }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.group_members && response.data.user_group) {
          this.addUserGroupForm.setValue({
            group_name: response.data.user_group.group_name,
            description: response.data.user_group.description,
            group_members: '',
          });

          var usersArr = [];

          response.data.group_members.forEach(element => {
            var data = {
              id: element.user_id._id,
              name: `${element.user_id.first_name} ${element.user_id.last_name} - ${element.hierarchy_id.designation}`
            };

            usersArr.push(data);
          });

          this.selected = usersArr;
        }
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  //Get users that assigned by designations
  getHierarchyUsers() {
    this.commonService.PostAPI(`${this.slug}hierarchy/get/by/parent`, { parent_user_id: this.parent_user_id }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.length > 0) {
          var usersArr = [];

          response.data.forEach(element => {
            var data = {
              id: element.user_id._id,
              name: `${element.user_id.first_name} ${element.user_id.last_name} - ${element.hierarchy_id.designation}`
            };

            usersArr.push(data);
          });

          this.items = usersArr;
        }
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  //For validation
  get formVal() {
    return this.addUserGroupForm.controls;
  }

  onChange(e) {
    this.selected = e;
  }

  submit() {
    this.isAddUserGroupFormValid = true;

    if (this.addUserGroupForm.invalid) {
      return;
    } else {
      if (this.selected && this.selected.length > 0) {
        const data = this.addUserGroupForm.value;
        data.group_members = this.selected.map(data => data.id);

        if (this.userGroupId) {
          data.id = this.userGroupId;

          this.commonService.PostAPI(`${this.slug}user_group/update`, data).then((response: any) => {
            if (response.status) {
              this.toastr.success(response.message, "Success");
              this.router.navigate(['/user-groups'])
            } else {
              this.toastr.error(response.message, "Error");
            }
          });
        } else {
          data.parent_user_id = this.parent_user_id;
          data.user_id = this.currentUserId;

          this.commonService.PostAPI(`${this.slug}user_group/create`, data).then((response: any) => {
            if (response.status) {
              this.toastr.success(response.message, "Success");
              this.router.navigate(['/user-groups'])
            } else {
              this.toastr.error(response.message, "Error");
            }
          });
        }
      } else {
        this.toastr.error("Please select any users", "Error");
        return;
      }
    }
  }

}
