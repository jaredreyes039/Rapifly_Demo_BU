import { Component, OnInit,ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from "src/app/services/common.service";
import { DataTableDirective } from 'angular-datatables';
declare var $: any;
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  currentuser;
  currentchildUser;
  plans : any = []
  goals : any = []
  plan_id;
  submitted: boolean = false;

  currentparentUser;
  ReportForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
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
    this.ReportForm = this.formBuilder.group({
      actual_revenue: ['', Validators.required],
      actual_expected: ['', Validators.required],
    });

  }
  get f() { return this.ReportForm.controls; }
  getallplan(){

    if(this.currentchildUser == null){
      this.currentchildUser = []
    }
    if(this.currentparentUser == null){
      this.currentparentUser = []
    }
    var children = this.currentchildUser.concat(this.currentparentUser);
    this.commonService.PostAPI('plan/get/allplanselectbox',{id:this.currentuser.user._id,childids:children} ).then((response: any) => {
      if (response.status) {
         this.plans = response.data;
         this.dtOptions = {
          columnDefs: [
            { orderable: false, targets: [1] }
          ],
          pagingType: 'full_numbers',
          pageLength: 10,
        };
        this.dtTrigger.next();
        // this.dataTableAfterViewInit();
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
  getplanid(planid){
   if(planid == ''){

    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.goals = [];
      this.dtTrigger.next();
    }else{
      this.plan_id = planid;
      this.resetSearch();
    }
  }
  getgoal(planid){
    this.plan_id = planid
    this.commonService.PostAPI('report/get/all',{plan_id:planid,user_id:this.currentuser.user._id} ).then((response: any) => {
      if (response.status) {
         this.goals = response.data;
       console.log(this.goals);

        this.dividearrayintothreepart = 1
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      } else {
        this.goals = [];
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
        // this.toastr.error(response.message, "Error");

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
  goal_id;
  report_id
  reportdetail
  showreportform(goalid,reportid,data){
    this.goal_id = goalid
    this.report_id = reportid
    if( this.report_id == ''){
      this.ReportForm.reset();
      this.submitted = false;
    }
    $("#myModal").modal("show");
      this.ReportForm.setValue({
        actual_revenue:data.actual_revenue,
        actual_expected: data.actual_expected,
      });
    // /this.submitted = false;
    // this.ReportForm.reset();
  }
  SaveReport(){
    this.submitted = true;
    if (this.ReportForm.invalid)
    {
      return;
    }
    else
    {
     var data = this.ReportForm.value
     data.report_id = this.report_id
     data.plan_id = this.plan_id
     data.goal_id = this.goal_id
     data.user_id = this.currentuser.user._id

     this.commonService.PostAPI('report/create', data).then((response: any) => {
      if (response.status)
      {
        this.toastr.success(response.message, "Success");
        this.ReportForm.reset();
        $("#myModal").modal("hide");
       this.resetSearch();
      } else
      {
        this.toastr.error(response.message, "Error");
      }
    });
    }
  }
  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
      });
    });
  }
}
