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
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.css']
})
export class UserGroupsComponent implements OnInit {

  changeDesignationForm: FormGroup;
  isChangeDesignationFormValid = false;

  userGroups: any = [];
  designations: any = [];

  currentuser;
  currentUserId;
  parent_user_id: any;
  changeRequestUser: any;

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
    this.currentuser = this.authenticationService.currentUserValue;
    this.currentUserId = this.currentuser.user._id;

    if (this.currentuser.role === 'Admin') {
      this.parent_user_id = this.currentuser.user._id;
    } else {
      this.parent_user_id = this.currentuser.user.parent_user_id;
    }

  }

  ngOnInit() {
    this.changeDesignationForm = this.formBuilder.group({
      hierarchy_id: ['', Validators.required]
    });

    this.getUserGroups();
  }

  //For validation
  get formVal() {
    return this.changeDesignationForm.controls;
  }

  getUserGroups() {
    this.commonService.PostAPI(`user_group/get/by/user`, { user_id: this.currentUserId }).then((response: any) => {
      if (response.status) {
        this.userGroups = response.data;
      } else {
        this.userGroups = [];
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

    this.getUserGroups();
  }

  updateStatus(e, id) {
    let status;

    if (e.target.checked) {
      status = 1;
    } else {
      status = 0;
    }

    this.commonService.PostAPI(`user_group/update/status`, { id: id, status: status }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, 'Success');
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  submit() {
    this.isChangeDesignationFormValid = true;

    if (this.changeDesignationForm.invalid) {
      return;
    } else {
      var data = this.changeDesignationForm.value;
      data.user_id = this.changeRequestUser.user._id;
      data.parent_user_id = this.parent_user_id;

      this.commonService.PostAPI(`hierarchy/change/user/designation`, data).then((response: any) => {
        if (response.status) {
          this.resetTable();
          this.toastr.success(response.message, "Success");
        } else {
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
