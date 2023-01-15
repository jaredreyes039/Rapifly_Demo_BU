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
import * as moment from 'moment';
@Component({
  selector: 'app-prioritize',
  templateUrl: './prioritize.component.html',
  styleUrls: ['./prioritize.component.css']
})
export class PrioritizeComponent implements OnInit {
  currentuser;
  currentchildUser;
  currentparentUser;
  plans: any = []
  goals: any = []
  high: any = []
  low: any = []
  medium: any = []
  plan_id;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

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
    this.currentchildUser = JSON.parse(window.localStorage.getItem("currentchildUser"));
    this.currentparentUser = JSON.parse(window.localStorage.getItem("currentparentUser"));
  }

  ngOnInit() {
    this.getallplan();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.dtTrigger.next()

  }
  updatepriority(index) {
    document.getElementById("label-priority-" + index).style.display = "none"
    document.getElementById("priority-text-" + index).style.display = "block"
  }
  updategoalpriority(goalid, index) {
    document.getElementById("label-priority-" + index).style.display = "block"
    document.getElementById("priority-text-" + index).style.display = "none"
    var changevalue: any = $("#input-priority-" + index).val();
    changevalue = parseInt(changevalue)

    if (changevalue > 0) {
      this.commonService.PostAPI(`${this.slug}goal/update/priority`, { goal_id: goalid, prioritize: changevalue }).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.getgoal(this.plan_id);
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    } else {
      this.toastr.error("Priority should be above 0.", "Error");
    }
  }

  getallplan() {

    if (this.currentchildUser == null) {
      this.currentchildUser = [];
    }
    this.commonService.PostAPI(`${this.slug}plan/get/allplanselectbox`, { id: this.currentuser.user._id, childids: this.currentchildUser }).then((response: any) => {
      if (response.status) {
        this.plans = response.data;

        // this.dtTrigger.next(); 
        // this.dataTableAfterViewInit();
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    });
  }

  changepriority(goal_id, current_priority, new_priority) {

    if (new_priority <= 1) {
      new_priority = 1;
    }

    var data = {
      goal_id: goal_id,
      current_priority: current_priority,
      new_priority: new_priority,
      plan_id: this.plan_id
    };

    this.commonService.PostAPI(`${this.slug}goal/priority/changebyid`, data).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.getgoal(this.plan_id);
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    })

  }

  dividearrayintothreepart = 0
  getgoal(planid) {
    if (planid == '') {

      this.dividearrayintothreepart = 0
    } else {
      this.plan_id = planid
      this.commonService.PostAPI(`${this.slug}goal/getgoals/bypid`, { id: planid }).then((response: any) => {
        if (response.status) {
          this.goals = response.data;
          this.dividearrayintothreepart = 1
          if (this.goals.length > 10) {
            this.dividearrayintothreepart = 2;
            var totallength = Math.floor(this.goals.length / 3);
            this.high = this.goals.slice(0, totallength)
            this.medium = this.goals.slice(totallength, totallength * 2)
            this.low = this.goals.slice(totallength * 2, this.goals.length)

          }
          // this.dtTrigger.next(); 
          // this.dataTableAfterViewInit();
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
    }


  }

  resetSearch() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
    });
    // this.getgoal2(this.plan_id);
  }
  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
        $('input', this.footer()).on('keyup change', function () {
          if (that.search() !== this['value']) {
            that
              .search(this['value'])
              .draw();
          }
        });
      });
    });
  }
}
@Pipe({ name: 'prioritizegoaldate' })
export class prioritizegoaldate implements PipeTransform {
  transform(value: string) {
    var datePipe = new DatePipe("en-IN");
    value = datePipe.transform(value, 'dd/MM/yyyy');

    return value;
  }
}