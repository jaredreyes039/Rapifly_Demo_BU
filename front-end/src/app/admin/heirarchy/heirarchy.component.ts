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
  plans: any = [];
  hierarchyForm: FormGroup;
  inviteUserForm: FormGroup;
  sharePlanForm: FormGroup;
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
    this.inviteUserForm = this.formBuilder.group({
      email: [''],
      designation: ['']
    })
    this.sharePlanForm = this.formBuilder.group({
      user: [''],
      plan: ['']
    })

    this.getUserPlans();
  }

  getUserPlans(){
    this.commonService.PostAPI('plan/get/by/user', { user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        // Misspelling present, but this is where the tree details seem to build?
        this.plans = response.data;
        console.log(response.data)
  }})
  }
  sharePlanWithTeamMember(){
    this.commonService.PostAPI(`share_plan/share`, {
      user_id: this.currentuser.user._id,
      plan_id: this.sharePlanForm.controls.plan.value,
      team_member_email: this.sharePlanForm.controls.user.value,
    }).then((res: any)=>{
      if(res.status){
        this.toastr.success(res.message, 'Success');
      }
      else {
        this.toastr.error(res.message, 'Error')
      }
    })
  }

  inviteUser(){
    this.toastr.success('Coming soon...', 'Under Construction');
  }
  //For validation
  get formVal() {
    return this.hierarchyForm.controls;
  }

}
