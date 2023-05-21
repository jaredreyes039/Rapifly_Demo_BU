import { Component, OnInit, ViewChild } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";
import { first } from "rxjs/operators";
import { Subject } from "rxjs";
import { CommonService } from "src/app/services/common.service";
import { DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-vote",
  templateUrl: "./vote.component.html",
  styleUrls: ["./vote.component.css"]
})
export class VoteComponent implements OnInit {
  currentuser;
  plans: any = [];
  goals: any = [];
  plan_id;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  currentchildUser;
  currentparentUser;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;


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
    // this.dtTrigger.next()
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
      .PostAPI(`plan/get/allplanselectbox`, {
        id: this.currentuser.user._id,
        childids: children
      })
      .then((response: any) => {
        if (response.status) {
          this.plans = response.data;

          this.dtOptions = {
            columnDefs: [{ orderable: false, targets: [1] }],
            pagingType: "full_numbers",
            pageLength: 10
          };
          this.dtTrigger.next();
          this.dataTableAfterViewInit();
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
  }
  dividearrayintothreepart = 0;
  resetSearch() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getgoal(this.plan_id);
  }
  getplanid(planid) {
    if (planid == "") {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
      this.goals = [];
      this.dtTrigger.next();
    } else {
      this.plan_id = planid;
      this.resetSearch();
    }
  }
  changevote(id, change) {
    this.commonService
      .PostAPI(`goal/voteupdown/byid`, {
        id: id,
        userid: this.currentuser.user._id,
        vote: change
      })
      .then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.resetSearch();
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
  }
  getgoal(planid) {
    this.plan_id = planid;
    this.commonService
      .PostAPI(`goal/getgoals/byvote`, { id: planid })
      .then((response: any) => {
        if (response.status) {
          this.goals = response.data;
          console.log();

          this.dividearrayintothreepart = 1;
          this.dtTrigger.next();
          this.dataTableAfterViewInit();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
  }
  checkvote(goal) {
  
    if (goal.voteup.includes(this.currentuser.user._id) == true ||goal.votedown.includes(this.currentuser.user._id) == true) {
      return true;
    } else {
      return false;
    }
  }
  getGoalByPlans() {
    var planIds = [];

    if (this.plans && this.plans.length > 0) {
      planIds = this.plans.map(data => data._id);
    }

    this.commonService
      .PostAPI(`goal/getgoals/byvote/all/plans`, { planIds: planIds })
      .then((response: any) => {
        if (response.status) {
          this.goals = response.data;
          this.dividearrayintothreepart = 1;
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

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function() {
        const that = this;
        // $('input', this.footer()).on('keyup change', function () {
        //   if (that.search() !== this['value']) {
        //     that
        //       .search(this['value'])
        //       .draw();
        //   }
        // });
      });
    });
  }
}
