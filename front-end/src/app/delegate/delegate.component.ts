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
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.css']
})
export class DelegateComponent implements OnInit {
  DelegateForm: FormGroup;
  currentuser;
  submitted: boolean = false;
  plans : any = []
  goals : any = []
  plan_id;
  currentchildUser;
  currentparentUser;
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
    this.getallchild();
    this.getalldelegategoals();
    this.DelegateForm = this.formBuilder.group({
      child_user_id: ['', Validators.required],
      percentage: ['', Validators.required],
      description: ['', Validators.required],
    });
  }
  getallplan()
  {
    // Get All Plan for Select Box
    if(this.currentchildUser == null){
      this.currentchildUser = []
    }
    if(this.currentparentUser == null){
      this.currentparentUser = []
    }
    var children = this.currentchildUser.concat(this.currentparentUser); 
    this.commonService.PostAPI(`${this.slug}plan/get/allplanselectbox`,{id:this.currentuser.user._id,childids:this.currentchildUser} ).then((response: any) => {
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
      } else 
      {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  childuser;
  get f() { return this.DelegateForm.controls; }
  getallchild()
  {
    //Get All Child Users
    if(this.currentchildUser == null){
      this.currentchildUser = []
    }
    this.commonService.PostAPI(`${this.slug}plan/get/allchilduser`,{childids:this.currentchildUser} ).then((response: any) => 
    {
      if (response.status) {
         this.childuser = response.data;
      }else 
      {
        // this.toastr.error(response.message, "Error");
     
      }
    });
  }
  dividearrayintothreepart = 0
  resetSearch() 
  {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
      this.getgoal(this.plan_id);
  }
  goalname;
  goalid;
  goaldelegatedata = [];
  totalgoalacceptpercentage;
  totalgoalrejectpercentage;
  totalgoalpendingpercentage;
  totalgoalpercentage;
  showdelegatform = false
  goaldelegate(id,name)
  {
    this.goalname = name
    this.goalid = id
    this.submitted = false;
    $("#myModal").modal("show");
   
    this.commonService.PostAPI(`${this.slug}delegation/get/goals`,{goal_id:this.goalid} ).then((response: any) => {
      if (response.status) {
        this.goaldelegatedata = response.data
         this.totalgoalacceptpercentage = 0
         this.totalgoalpendingpercentage = 0
         this.totalgoalrejectpercentage = 0
         this.totalgoalpercentage = 0
        this.goaldelegatedata.forEach(element => {
        
          if(element.is_accept==1){
            this.totalgoalacceptpercentage = this.totalgoalacceptpercentage + element.percentage;
          }else if(element.is_accept==0){
            this.totalgoalpendingpercentage = this.totalgoalpendingpercentage + element.percentage;
          }else if(element.is_accept==2){
            this.totalgoalrejectpercentage = this.totalgoalrejectpercentage + element.percentage;
          }
        });
       
        
         this.totalgoalpercentage = 100 - (Number(this.totalgoalacceptpercentage)+Number(this.totalgoalpendingpercentage));
        if( this.totalgoalpercentage == 100){
          this.showdelegatform = true
        }else{
          this.showdelegatform = false
        }
      } 
      else 
      {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  getplanid(planid)
  {
    if(planid == '')
    {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
      this.goals = [];
      this.dtTrigger.next();
    }
    else
    {
      this.plan_id = planid;
      this.resetSearch();
    }
  }
  changegoaldelegatestatus(id, status)
  {
    this.commonService.PostAPI(`${this.slug}delegation/accept/status`,{delegation_id:id,accept_status:status} ).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.getalldelegategoals();
      } 
      else 
      {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  SaveDelegate(){
    //Save Delegate Goal Modal
    this.submitted = true;
    if (this.DelegateForm.invalid) 
    {
      return;
    } 
    else 

    {
      console.log(this.f.percentage.value);
      console.log(this.totalgoalpercentage);
      
      if(Number(this.f.percentage.value)<=Number(this.totalgoalpercentage)){
        var data = this.DelegateForm.value;
      
        data.user_id = this.currentuser.user._id;
        data.goal_id = this.goalid;
        data.plan_id = this.plan_id;
        data.start_date = new Date().getTime();
        data.end_date = new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).getTime();
        data.parent_user_id = this.currentuser.user.parent_user_id;
        this.commonService.PostAPI('delegation/create', data).then((response: any) => {
          if (response.status) 
          {
            this.toastr.success(response.message, "Success");
            this.DelegateForm.reset();
            $("#myModal").modal("hide");
          } else
          {
            this.toastr.error(response.message, "Error");
          }
        });
      }else{
        this.toastr.error("Your Percentage Extends from total percentage ", "Error");
      }
    }
  }
  delegategoals = [];
  getalldelegategoals()
  {
    this.commonService.PostAPI(`${this.slug}delegation/get/user/goals`,{child_user_id:this.currentuser.user._id} ).then((response: any) => {
      if (response.status) {
        this.delegategoals = response.data;
      } 
      else 
      {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  getgoal(planid){
    this.plan_id = planid
    this.commonService.PostAPI(`${this.slug}goal/getgoals/bydelegate`,{id:planid} ).then((response: any) => {
      if (response.status) {
         this.goals = response.data;
         this.dividearrayintothreepart = 1
         this.dtTrigger.next();
         this.dataTableAfterViewInit();
      } 
      else 
      {
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
  dataTableAfterViewInit() 
  {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => 
    {
      dtInstance.columns().every(function () 
      {
        const that = this;
      });
    });
  }
}
