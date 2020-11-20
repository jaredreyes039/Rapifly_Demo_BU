import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import { PlatformLocation } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-heirarchy',
  templateUrl: './heirarchy.component.html',
  styleUrls: ['./heirarchy.component.css']
})
export class HeirarchyComponent implements OnInit {

  organizations: any = [];
  roles: any = [];
  users: any = [];

  hierarchyForm: FormGroup;
  isHierarchyFormValid = false;

  isShowSubHierarchy: boolean = false;
  isShowHierarchy: boolean = false;

  selectedDomain: any = '';

  currentuser;
  currentUrl;
  currentUserId;
  parent_user_id: any = "";
  hierarchy_id: any = "";

  title = '';
  type = 'OrgChart';
  data = [];
  userHierarchyData = [];
  columnNames = ["Name", "Manager", "Tooltip"];
  options = {
    allowHtml: true,
  };
  width = "500";
  height = "500";

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
    this.currentUserId = this.currentuser.user._id;

    if (this.currentuser.role == "Admin") {
      this.parent_user_id = this.currentuser.user._id;
    } else {
      this.parent_user_id = this.currentuser.user.parent_user_id;
    }
  }

  ngOnInit() {
    this.hierarchyForm = this.formBuilder.group({
      designation: ['', Validators.required],
      user_id: [''],
    });

    this.getHierarchyUsers();
    this.hierarchyDiagram();
  }

  //Get users that assigned by designations
  getHierarchyUsers() {
    if (this.currentuser.role == "Admin") {
      this.commonService.PostAPI('hierarchy/get/by/parent', { parent_user_id: this.parent_user_id }).then((response: any) => {
        console.log("HeirarchyComponent -> getHierarchyUsers -> response", response)
        if (response.status) {
          this.users = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    } else if (this.currentuser.role == "User") {
      this.commonService.PostAPI('hierarchy/get/by/user', { user_id: this.currentUserId }).then((response: any) => {
        console.log("HeirarchyComponent -> getHierarchyUsers -> response", response)
        if (response.status) {
          this.users = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    }
  }

  //For validation
  get formVal() {
    return this.hierarchyForm.controls;
  }

  getHierarchyId(e) {
    const id = $("#" + e.target.id + " option:selected").attr('data-hierarchy-id');

    if (id) {
      this.hierarchy_id = id;
    }
  }

  submit() {
    this.isHierarchyFormValid = true;

    if (this.hierarchyForm.invalid) {
      return;
    } else {
      const data = this.hierarchyForm.value;
      data.parent_user_id = this.parent_user_id;
      data.parent_hierarchy_id = this.hierarchy_id;

      this.commonService.PostAPI('hierarchy/save', data).then((response: any) => {
        if (response.status) {
          this.hierarchyDiagram();

          this.hierarchyForm.reset();
          this.isHierarchyFormValid = false;
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  //fetch data of designations and display in organization chart
  hierarchyDiagram() {
    this.commonService.PostAPI('hierarchy/designations', { parent_user_id: this.parent_user_id }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.length > 0) {
          this.data = response.data;
          this.isShowHierarchy = true;
        } else {
          this.data = [];
          this.isShowHierarchy = false;
        }
      } else {
        this.toastr.error(response.message, 'Error');
        this.isShowHierarchy = false;
      }
    });
  }

  //fetch data of users and its designations and display in organization chart
  getHierarchyDetails(event) {
    var hierarchy_id = event.target.title;

    this.commonService.PostAPI('hierarchy/users', { parent_user_id: this.parent_user_id, hierarchy_id: hierarchy_id }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.length > 0) {
          this.userHierarchyData = response.data;
          this.isShowSubHierarchy = true;
        } else {
          this.userHierarchyData = [];
          this.isShowSubHierarchy = false;
        }
      } else {
        this.toastr.error(response.message, 'Error');
        this.isShowSubHierarchy = false;
      }
    });
  }
}
