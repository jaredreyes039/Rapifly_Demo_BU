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
  members: any = []
  distributionList: any = [
    {
      name: "Jay Reyes",
      email: "Jaredreyes039@gmail.com",
      designation: "Basic",
      plan_short_name: "Test",
      plan_id: "w9hr0283rn2ufh8094"
    }
  ]
  invitesList: any = [];
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
    this.getInvites();
    this.getTeamMembers()
  }

  getInvites(){
    this.commonService.PostAPI('share_plan/get/invites', {
      user_id: this.currentuser.user._id,
      email: this.currentuser.user.email
    }).then((res: any)=>{
      if(res.status){
        this.invitesList = res.data
      }
      else {
        return this.toastr.error(res.message, 'Error')
      }
    })
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
      member_id: this.sharePlanForm.controls.user.value,
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
    console.log(this.currentuser)
    this.commonService.PostAPI('share_plan/invite/member', {
      user_id: this.currentuser.user._id,
      user_email: this.currentuser.user.email,
      user: {
        first_name: this.currentuser.user.first_name,
        last_name: this.currentuser.user.last_name
      },
      member_designation: this.inviteUserForm.controls.designation.value,
      member_email: this.inviteUserForm.controls.email.value,
      accepted: false,
    }).then((res: any)=>{
      if(res.status){
        this.toastr.success(res.message, 'Success');
      }
      else {
        this.toastr.error("Something is wrong, connection not established", 'Error')
      }
    })

  }
  //For validation
  get formVal() {
    return this.hierarchyForm.controls;
  }

  acceptInvitation(event){
    console.log(event.target.value)
    this.commonService.PostAPI('share_plan/accept/invite', {
      user_id: this.currentuser.user._id,
      member_email: event.target.value,
      member_id: event.target.id
    }).then((res: any)=>{
      if(res.status){
        return this.toastr.success(res.message, 'Success')
      }
      else {
        return this.toastr.error(res.message, 'Error')
      }
    })
  }
  rejectInvitation(event){
    this.commonService.PostAPI('share_plan/reject/invite', {
      user_id: this.currentuser.user._id,
      member_email: event.target.value,
      member_id: event.target.id
    }).then((res: any)=>{
      if(res.status){
        return this.toastr.success(res.message, 'Success')
      }
      else {
        return this.toastr.error(res.message, 'Error')
      }
    })
  }

  getTeamMembers(){
    this.commonService.PostAPI('user_group/get/by/user', {
      user_id: this.currentuser.user._id,
    }).then((res: any)=>{
      if(res.status){
        console.log(res.data)
        res.data[0].group_members.map((member)=>{
          this.members.push({
            first_name: member.user.first_name,
            last_name: member.user.last_name,
            email: member.user.email,
            avatar: member.user.avatar,
            user_id: member.user_id
          })
        })
        console.log(this.members)
        return this.toastr.success("Retrieved team information.", 'Success')
      }
      else {
        return this.toastr.error(res.message, 'Error')
      }
    })
  }

}
