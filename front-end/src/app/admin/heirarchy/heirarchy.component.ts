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
  userTeams: any = [];
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
  newTeamForm: FormGroup;
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
      designation: [''],
      team: ['']
    })
    this.sharePlanForm = this.formBuilder.group({
      user: [''],
      plan: ['']
    })

    this.getUserPlans();
    this.getInvites();
    this.initFormGroups();
    this.getTeams();
  }

  initFormGroups(){
    this.newTeamForm = this.formBuilder.group({
      name: [''],
      description: [''],
    })
  }

  getInvites(){
    this.commonService.PostAPI('share_plan/get/invites', {
      user_id: this.currentuser.user._id,
      email: this.currentuser.user.email
    }).then((res: any)=>{
      if(res.status){
        console.log(this.invitesList)
        this.invitesList = res.data
        this.invitesList = this.invitesList.filter((invite)=>{
          return invite.accepted === false
        })
        this.invitesList = this.invitesList.filter((invite)=>{
          return invite.rejected === false;
        })
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
    console.log(this.inviteUserForm.controls.team.value)
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
      team_id: this.inviteUserForm.controls.team.value
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
    this.commonService.PostAPI('teams/accept/invite', {
      user_id: this.currentuser.user._id,
      user_email: this.currentuser.user.email,
      role: event.target.value,
      team_id: event.target.id
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



  createTeam(){
    let teamData = this.newTeamForm.value;
    teamData.owner_id = this.currentuser.user._id;
    teamData.owner_email = this.currentuser.user.email;

    this.commonService.PostAPI(`teams/create`, teamData)
    .then((res:any)=>{
      return this.toastr.success(res.message, 'Success')
    })

    this.newTeamForm.reset();
  }

  getTeams(){
    this.commonService.PostAPI(`teams/get/teams`, {
      user_id: this.currentuser.user._id
    }).then((res:any)=>{
      if(res.status){
        this.userTeams = res.data;
        console.log(this.userTeams)
        return this.toastr.success(res.message, 'Success')
      }
      else {
        return this.toastr.error(res.message, 'Error')
      }
    })
  }

}
