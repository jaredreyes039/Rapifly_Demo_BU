import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";

import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'
declare var $: any;
import * as moment from 'moment'

@Component({
  selector: 'app-improve',
  templateUrl: './improve.component.html',
  styleUrls: ['./improve.component.css']
})
export class ImproveComponent implements OnInit {
  ImprovePlanForm: FormGroup;
  submitted: boolean = false;
  currentchildUser
  plans: any = []
  currentuser;
  planId;
  currentparentUser
  planteeDetails: any = [];
  parentplanDetails: any = [];
  childgoalDetails: any = [];
  finalarray = [];

  plan_id;
  planstartdate;
  planenddate;
  golaplanname;
  goalplanid;

  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    this.currentchildUser = JSON.parse(window.localStorage.getItem("currentchildUser"));
    this.currentparentUser = JSON.parse(window.localStorage.getItem("currentparentUser"));
  }

  ngOnInit() {
    this.ImprovePlanForm = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: ['', Validators.required],
      expected_target: ['', Validators.required],
      revenue_target: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      plan_id: ['', Validators.required],
    });
    this.getallplan();

    $("#date-input1").datepicker();
    $("#date-input2").datepicker();
  }

  get f() { return this.ImprovePlanForm.controls; }

  getallplan() {
    if (this.currentchildUser == null) {
      this.currentchildUser = []
    }
    if (this.currentparentUser == null) {
      this.currentparentUser = []
    }
    var children = this.currentchildUser.concat(this.currentparentUser);
    this.commonService.PostAPI('plan/get/allplanselectbox', { id: this.currentuser.user._id, childids: children }).then((response: any) => {
      if (response.status) {
        this.plans = response.data;
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    });
  }

  getplanid(planid) {
    if (planid == '') {

    } else {
      this.plan_id = planid;
      this.commonService.PostAPI('plan/get/by/id2', { plan_id: this.plan_id }).then((response: any) => {
        if (response.status) {
          this.parentplanDetails = response.data;
          this.goalplanid = this.parentplanDetails[0]._id;
          this.planstartdate = this.parentplanDetails[0].start_date;
          this.planenddate = this.parentplanDetails[0].end_date;
          this.golaplanname = this.parentplanDetails[0].short_name;
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.ImprovePlanForm.invalid) {
      return;
    } else {
      if ($('#date-input1').val() == '') {
        this.toastr.error("Please Enter Start Date", "Error");
        return;
      } else if ($('#date-input2').val() == '') {
        this.toastr.error("Please Enter End Date", "Error");
        return;
      } else {
        if (new Date($('#date-input1').val()) > new Date($('#date-input2').val())) {
          this.toastr.error("Your start date is greater than End Date", "Error");
        } else {
          if (new Date(this.planstartdate) <= new Date($('#date-input1').val()) && new Date(this.planenddate) >= new Date($('#date-input1').val()) && new Date(this.planstartdate) <= new Date($('#date-input2').val()) && new Date(this.planenddate) >= new Date($('#date-input2').val())) {
            var data = this.ImprovePlanForm.value;

            data.user_id = this.currentuser.user._id;
            data.status = 0;
            data.numbers = 0;
            data.start_date = $('#date-input1').val();
            data.end_date = $('#date-input2').val();

            this.commonService.PostAPI('goal/create', data).then((response: any) => {
              if (response.status) {
                this.toastr.success(response.message, "Success");
                this.ImprovePlanForm.reset();
                this.submitted = false;
              } else {
                this.toastr.error(response.message, "Error");
              }
            });
          } else {
            this.toastr.error("Your goal's start date and end date are extended from your plan", "Error");
          }
        }
      }
    }
  }
}
