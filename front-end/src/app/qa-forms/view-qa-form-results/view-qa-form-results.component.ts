import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "src/app/services/common.service";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-view-qa-form-results',
  templateUrl: './view-qa-form-results.component.html',
  styleUrls: ['./view-qa-form-results.component.css']
})
export class ViewQaFormResultsComponent implements OnInit {

  currentUser;
  currentUserId;

  formId: any;
  formDetail: any;

  tableKeys: any = [];
  formResults: any = [];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  isFormAnswerAvailable: boolean = false;

  totalAnswers: Number = 0;
  reports: any = [];

  constructor(
    private toastr: ToastrService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private authService: AuthenticationService
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.currentUserId = this.currentUser.user._id;

    if (this.route.snapshot.params && this.route.snapshot.params.id && this.route.snapshot.params.id != '') {
      this.formId = this.route.snapshot.params.id;
    }
  }

  ngOnInit() {
    if (this.formId && this.formId != null) {
      this.getFormDetails(this.formId)
    }
  }

  getFormDetails(form_id) {
    this.commonService.PostAPI('qa/get/form/by/id', { form_id: form_id }).then((response: any) => {
      if (response.status) {
        this.formDetail = response.data;
        this.getFormResultList();
        this.getReports();
      } else {
        this.formDetail;
      }
    });
  }

  getFormResultList() {
    this.commonService.PostAPI('qa/form/list', { form_name: this.formDetail.form_name }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.formResults = response.data;
        this.tableKeys = this.formResults[0];
        this.isFormAnswerAvailable = true;
        this.totalAnswers = response.data.length;
      } else {
        this.formResults = [];
        this.tableKeys = [];
        this.isFormAnswerAvailable = false;
        this.totalAnswers = 0;
      }

      setTimeout(() => {
        this.dtOptions = {
          columnDefs: [
            { orderable: false, targets: [1] }
          ],
          pagingType: 'full_numbers',
          pageLength: 10,
        };
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      }, 1000);
    });
  }

  getReports(){
    this.commonService.PostAPI('qa/form/get/report', { form_name: this.formDetail.form_name }).then((response: any) => {
      console.log(response.data);
      if(response.data && response.data.length > 0){
        this.reports = response.data;
      }else{
        this.reports = [];
      }
    });
  }

  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
      });
    });
  }

  textDecoration(string) {
    var newString = string.replace(/_/g, " ");
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }
}
