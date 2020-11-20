import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: 'app-change-hieararchy',
  templateUrl: './change-hieararchy.component.html',
  styleUrls: ['./change-hieararchy.component.css']
})
export class ChangeHieararchyComponent implements OnInit {

  currentuser;
  currentUrl;
  currentUserId;
  parent_user_id: any = "";
  hierarchy_id: any = "";

  users: any = [];

  hierarchyForm: FormGroup;
  isHierarchyFormValid = false;

  items = [];
  selected = [];

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
    this.hierarchyForm = this.formBuilder.group({
      designation: ['', Validators.required],
      user_id: ['', Validators.required],
      assign_designations: ['',],
    });

    this.getHierarchyUsers();
    this.getDesignations();
  }

  //Get users that assigned by designations
  getHierarchyUsers() {
    this.commonService.PostAPI('hierarchy/get/by/parent', { parent_user_id: this.parent_user_id }).then((response: any) => {
      if (response.status) {
        this.users = response.data;
      } else {
        this.users = [];
      }
    });
  }

  getDesignations() {
    this.commonService.PostAPI('hierarchy/get/designation', { parent_user_id: this.parent_user_id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.items = response.data;  
      } else {
        this.items = [];
      }
    });
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

  onChange(e) {
    this.selected = e;
  }

  submit() {
    this.isHierarchyFormValid = true;

    if (this.hierarchyForm.invalid) {
      return;
    } else {
      const data = this.hierarchyForm.value;
      data.parent_user_id = this.parent_user_id;
      data.parent_hierarchy_id = this.hierarchy_id;
      data.assign_designations = this.selected;

      this.commonService.PostAPI('hierarchy/update', data).then((response: any) => {
        if (response.status) {
          this.hierarchyForm.reset();
          this.isHierarchyFormValid = false;
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

}
