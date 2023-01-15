import { Component, OnInit, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from "src/app/services/common.service";
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-selected-vote',
  templateUrl: './selected-vote.component.html',
  styleUrls: ['./selected-vote.component.css']
})
export class SelectedVoteComponent implements OnInit {
  currentuser;
  plans: any = []
  goals: any = []
  plan_id;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  currentchildUser;
  currentparentUser;
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
  }

  getallplan() {
    this.currentparentUser = JSON.parse(window.localStorage.getItem("currentparentUser"));
    this.commonService.PostAPI(`${this.slug}plan/get/allplanselectbox`, { id: this.currentuser.user._id, childids: this.currentchildUser }).then((response: any) => {
      if (response.status) {
        this.plans = response.data;
        // this.getGoalByPlans();
        this.dtOptions = {
          columnDefs: [
            { orderable: false, targets: [1] }
          ],
          pagingType: 'full_numbers',
          pageLength: 10,
        };
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    });
  }

  dividearrayintothreepart = 0

  resetSearch() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getgoal(this.plan_id);
  }

  getplanid(planid) {
    if (planid == '') {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
      // this.getGoalByPlans();
      this.goals = [];
      this.dtTrigger.next();
    } else {
      this.plan_id = planid;
      this.commonService.PostAPI(`${this.slug}plan/get/by/id2`, { plan_id: this.plan_id }).then((response: any) => {
        if (response.status) {
          this.plansecurity = response.data[0].security
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
      this.resetSearch();
    }
  }

  plansecurity;
  updateplanselect(e, goal_id) {
    var status: number;

    if (e.target.checked) {
      status = 1;
    } else {
      status = 0;
    }
    this.commonService.PostAPI(`${this.slug}goal/update/select`, {
      select: status,
      id: goal_id,
      security: this.plansecurity
    }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        // this.resetSearch() 
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  getgoal(planid) {

    this.plan_id = planid
    this.commonService.PostAPI(`${this.slug}goal/getgoals/byvote`, { id: planid }).then((response: any) => {
      if (response.status) {
        this.goals = response.data;
        this.dividearrayintothreepart = 1
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  getGoalByPlans() {
    var planIds = [];

    if (this.plans && this.plans.length > 0) {
      planIds = this.plans.map(data => data._id);
    }

    this.commonService.PostAPI(`${this.slug}goal/getgoals/byvote/all/plans`, { planIds: planIds }).then((response: any) => {
      if (response.status) {
        this.goals = response.data;
        this.dividearrayintothreepart = 1
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  datatableRerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      this.dataTableAfterViewInit();
    });
  }

  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;

      });
    });
  }
}
