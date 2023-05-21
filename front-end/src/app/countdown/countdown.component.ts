import { Component, OnInit,ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from "src/app/services/common.service";
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit {
  
  currentuser;
  currentchildUser;
  plans : any = []
  goals : any = []
  plan_id;
  currentparentUser;
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
  }
  getallplan(){
   
    if(this.currentchildUser == null){
      this.currentchildUser = []
    }
    if(this.currentparentUser == null){
      this.currentparentUser = []
    }
    var children = this.currentchildUser.concat(this.currentparentUser); 
    this.commonService.PostAPI(`plan/get/allplanselectbox`,{id:this.currentuser.user._id,childids:children} ).then((response: any) => {
      if (response.status) {
         this.plans = response.data;
         console.log(this.plans);
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

  updateplanselect(e, goal_id){
    var status: number;
  
    if(e.target.checked){
      status = 1;
    }else{
      status = 0;
    }
  
    this.commonService.PostAPI(`goal/update/select`, {
      select: status,
      id: goal_id
    }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
      // this.resetSearch() 

      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  getgoal(planid){
    
    this.plan_id = planid
    this.commonService.PostAPI(`goal/getgoals/bycountdown`,{id:planid} ).then((response: any) => {
      if (response.status) {
         this.goals = response.data;
         this.goals.forEach((element1,index) => {
          var finalhours = 0;
          var finalminutes = 0;
          if(element1.countdown){
            if(new Date(this.goals[0].start_date).getTime() >= new Date().getTime()){
              var end_time = new Date().getTime();
            }
            if(new Date(this.goals[0].start_date).getTime() == new Date().getTime()){
            var end_time = new Date(this.goals[0].start_date).getTime();
            }
            if(new Date(this.goals[0].start_date).getTime() <= new Date().getTime()){
             var end_time = new Date(this.goals[0].start_date).getTime();
            }
            var diff = end_time - element1.countdown;
            var days = Math.floor(diff / (60 * 60 * 24 * 1000));
            var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
            var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
            var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
            finalhours += hours;
            finalminutes += minutes;
            if(finalminutes>60){
              finalhours++;
              finalminutes = finalminutes-60;
            }
            this.goals[index]['total_time'] =  finalhours+':'+finalminutes;
        }
      })
       
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
 

  
  // ngOnDestroy(): void {
  //   // Do not forget to unsubscribe the event
  //   this.dtTrigger.unsubscribe();
  // }
  
  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
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
