import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from 'src/app/services/common.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-qa-forms',
  templateUrl: './qa-forms.component.html',
  styleUrls: ['./qa-forms.component.css']
})
export class QaFormsComponent implements OnInit {

  currentUser;
  currentUserId;
  parentUserId;

  forms: any = [];

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
    this.currentUser = this.authenticationService.currentUserValue;

    this.currentUserId = this.currentUser.user._id;
    this.parentUserId = this.currentUser.user.parent_user_id;
  }

  ngOnInit() {
    this.getForms();
  }

  getForms() {
    this.commonService.PostAPI(`${this.slug}qa/get/by/parent`, { parent_user_id: this.parentUserId }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.forms = response.data;
      } else {
        this.forms = [];
      }

      this.dtOptions = {
        columnDefs: [
          { orderable: false, targets: [1] }
        ],
        pagingType: 'full_numbers',
        pageLength: 10,
      };
      this.dtTrigger.next();
      this.dataTableAfterViewInit();
    });
  }

  resetTable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });

    this.getForms();
  }

  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
      });
    });
  }

}
