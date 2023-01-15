import { Component, OnInit, ViewChild } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";
import { first } from "rxjs/operators";
import { Subject } from "rxjs";
import { CommonService } from "src/app/services/common.service";
import { Pipe, PipeTransform } from "@angular/core";
import { DatePipe } from "@angular/common";
import { DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-propose",
  templateUrl: "./propose.component.html",
  styleUrls: ["./propose.component.css"]
})
export class ProposeComponent implements OnInit {
  currentuser;
  plans: any = [];
  goals: any = [];
  high: any = [];
  low: any = [];
  medium: any = [];
  plan_id;
  currentparentUser;
  currentchildUser;

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"

  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService
  ) {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    this.currentchildUser = JSON.parse(
      window.localStorage.getItem("currentchildUser")
    );
    this.currentparentUser = JSON.parse(
      window.localStorage.getItem("currentparentUser")
    );
  }

  ngOnInit() {
    this.getallplan();
  }

  getallplan() {
    if (this.currentchildUser == null) {
      this.currentchildUser = [];
    }
    if (this.currentparentUser == null) {
      this.currentparentUser = [];
    }
    var children = this.currentchildUser.concat(this.currentparentUser);
    this.commonService
      .PostAPI(`${this.slug}plan/get/allplanselectbox`, {
        id: this.currentuser.user._id,
        childids: this.currentchildUser
      })
      .then((response: any) => {
        if (response.status) {
          this.plans = response.data;
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
  }

  dividearrayintothreepart = 0;
  checkboxshow = false;
  getgoal(planid) {
    if (planid == "") {
      this.checkboxshow = false;
      this.dividearrayintothreepart = 0;
    } else {
      this.plan_id = planid;
      this.commonService.PostAPI(`${this.slug}plan/get/by/id2`, { plan_id: planid }).then((response: any) => {
        if (response.status) {
          if (response.data[0].user_id._id == this.currentuser.user._id) {

            this.commonService.PostAPI(`${this.slug}propose/get/goal/by/plan`, { plan_id: planid, user_id: this.currentuser.user._id }).then((response: any) => {
              if (response.status) {
                this.goals = []
                this.goals = response.data;
                this.dividearrayintothreepart = 1
                if (this.goals.length > 10) {
                  this.dividearrayintothreepart = 2;
                  var totallength = Math.floor(this.goals.length / 3);
                  this.high = this.goals.slice(0, totallength)
                  this.medium = this.goals.slice(totallength, totallength * 2)
                  this.low = this.goals.slice(totallength * 2, this.goals.length)
                }

              } else {
                this.toastr.error("No Details Found", "Error");

              }
            });
          } else if (response.data[0].user_id._id != this.currentuser.user._id) {

            this.commonService.PostAPI(`${this.slug}propose/get/superior/goals`, { plan_id: planid, user_id: this.currentuser.user._id }).then((response: any) => {
              if (response.status) {

                this.goals = []
                response.data.forEach(element => {
                  this.goals.push(element.data.goal_id)
                });
                this.dividearrayintothreepart = 1;

                if (this.goals.length > 10) {
                  this.dividearrayintothreepart = 2;
                  var totallength = Math.floor(this.goals.length / 3);
                  this.high = this.goals.slice(0, totallength);
                  this.medium = this.goals.slice(totallength, totallength * 2);
                  this.low = this.goals.slice(totallength * 2, this.goals.length);
                }

              } else {
                this.toastr.error("No Details Found", "Error");
              }
            });
          } else {

          }
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }

  }
  changeproposal(id, change) {
    this.commonService
      .PostAPI(`${this.slug}propose/manage`, {
        goal_id: id,
        plan_id: this.plan_id,
        user_id: this.currentuser.user._id
      })
      .then((response: any) => {
        if (response.status) {

          this.toastr.success(response.message, "Success");

        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }

        this.getgoal(this.plan_id);
      });
  }

  handleChange($event, id) {
    if ($event.target.checked === true) {
      var changepropose = 1;
    } else {
      var changepropose = 0;
    }

    this.commonService
      .PostAPI(`${this.slug}goal/proposal/changebyid`, { id: id, propose: changepropose })
      .then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.getgoal(this.plan_id);
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
  }
}
