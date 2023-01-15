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
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  changeDesignationForm: FormGroup;
  isChangeDesignationFormValid = false;

  users: any = [];
  designations: any = [];

  currentuser;
  currentUserId;
  parent_user_id: any;
  changeRequestUser: any;

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

    this.getUsers();
  }

  //For validation
  get formVal() {
    return this.changeDesignationForm.controls;
  }

  getUsers() {
    if (this.currentuser.role === 'Admin') {
      this.commonService.PostAPI(`${this.slug}users/get/by/parent`, { parent_user_id: this.parent_user_id }).then((response: any) => {
        if (response.status) {
          this.users = response.data;
        } else {
          this.users = [];
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
    } else if (this.currentuser.role === 'User') {
      this.commonService.PostAPI(`${this.slug}users/get/invited`, { user_id: this.currentUserId }).then((response: any) => {
        if (response.status) {
          this.users = response.data;
        } else {
          this.users = [];
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
  }

  resetTable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });

    this.getUsers();
  }

  getDesignations() {
    if (this.currentuser.role == "Admin") {
      this.commonService.PostAPI(`${this.slug}hierarchy/get/designation`, { parent_user_id: this.parent_user_id }).then((response: any) => {
        if (response.status) {
          this.designations = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    } else if (this.currentuser.role == "User") {
      this.commonService.PostAPI(`${this.slug}hierarchy/get/child/designation`, { user_id: this.currentUserId }).then((response: any) => {
        if (response.status) {
          this.designations = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    }
  }

  updateUserStatus(e, id) {
    let status;

    if (e.target.checked) {
      status = 1;
    } else {
      status = 0;
    }

    this.commonService.PostAPI(`${this.slug}users/update/status`, { id: id, status: status }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, 'Success');
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  openModal() {
    $("#changeDesignationModal").modal('show');
  }

  closeModal() {
    $("#changeDesignationModal").modal('hide');
  }

  changeDesignation(userDetails) {
    this.changeRequestUser = userDetails;
    this.openModal();
    this.getDesignations();
  }

  submit() {
    this.isChangeDesignationFormValid = true;

    if (this.changeDesignationForm.invalid) {
      return;
    } else {
      var data = this.changeDesignationForm.value;
      data.user_id = this.changeRequestUser.user._id;
      data.parent_user_id = this.parent_user_id;

      this.commonService.PostAPI(`${this.slug}hierarchy/change/user/designation`, data).then((response: any) => {
        if (response.status) {
          this.resetTable();
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }

        this.closeModal();
      });
    }
  }

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
