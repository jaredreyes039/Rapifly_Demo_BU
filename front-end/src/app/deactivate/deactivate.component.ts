import { Component, OnInit, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from "src/app/services/common.service";
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-deactivate',
  templateUrl: './deactivate.component.html',
  styleUrls: ['./deactivate.component.css']
})
export class DeactivateComponent implements OnInit {
  currentuser;
  plans: any = []
  goals: any = []
  high: any = []
  low: any = []
  medium: any = []
  plan_id;
  currentchildUser;
  currentparentUser;
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
    this.getallplan();
  }
  getallplan() {
    if (this.currentchildUser == null) {
      this.currentchildUser = [];
    }
    var children = this.currentchildUser.concat(this.currentparentUser);
    this.commonService.PostAPI('plan/get/allplanselectbox', { id: this.currentuser.user._id, childids: this.currentchildUser }).then((response: any) => {
      if (response.status) {
        this.plans = response.data;

      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    });
  }
  dividearrayintothreepart = 0
  getgoal(planid) {
    if (planid == '') {
      this.dividearrayintothreepart = 0
    } else {
      this.plan_id = planid;
      this.commonService.PostAPI('goal/get/all/by/plan', { id: planid }).then((response: any) => {
        if (response.status) {
          this.goals = response.data;
          console.log(this.goals);
          this.dividearrayintothreepart = 1
          if (this.goals.length > 10) {
            this.dividearrayintothreepart = 2;
            var totallength = Math.floor(this.goals.length / 3);
            this.high = this.goals.slice(0, totallength)
            this.medium = this.goals.slice(totallength, totallength * 2)
            this.low = this.goals.slice(totallength * 2, this.goals.length)
          }
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }
  changedeactivate(id, change) {
    this.commonService.PostAPI('goal/deactivate/changebyid', { id: id, deactivate: change }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.getgoal(this.plan_id);
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    })
  }
}
