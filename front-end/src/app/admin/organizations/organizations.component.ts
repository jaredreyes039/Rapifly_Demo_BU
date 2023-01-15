import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css']
})
export class OrganizationsComponent implements OnInit {

  public plans: any;
  public orgRecords: any = [];

  addOrganizationForm: FormGroup;
  editOrganizationForm: FormGroup;

  IsAddOrganizationFormValid = false;
  IsEditOrganizationFormValid = false;

  currentuser;
  editedOrg: any = [];

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
  ) { }

  ngOnInit() {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));

    this.addOrganizationForm = this.formBuilder.group({
      name: ['', Validators.required],
      domain_name: ['', Validators.required],
      can_invite: ['', Validators.required],
    });

    this.editOrganizationForm = this.formBuilder.group({
      name: ['', Validators.required],
      domain_name: ['', Validators.required],
      can_invite: ['', Validators.required],
    });

    this.getOrganizations();
  }

  get insertVal() {
    return this.addOrganizationForm.controls;
  }

  get editVal() {
    return this.editOrganizationForm.controls;
  }

  submit() {
    this.IsAddOrganizationFormValid = true;
    if (this.addOrganizationForm.invalid) {
      return;
    } else {
      const data = this.addOrganizationForm.value;

      this.commonService.PostAPI(`${this.slug}organization/create`, data).then((response: any) => {
        if (response.status) {
          $("#myModal").modal('hide');
          this.toastr.success(response.message, 'Success');
          this.getOrganizations();
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    }
  }

  getOrganizations() {
    this.commonService.GetAPI(`${this.slug}organization/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.orgRecords = response.data;
        this.loadDatatables();
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  loadDatatables() {
    setTimeout(function () { $('#example').dataTable() }, 1000);
  }

  openEditModal(org) {
    this.editedOrg = org;

    this.editOrganizationForm.setValue({
      name: org.name,
      domain_name: org.domain_name,
      can_invite: org.can_invite
    });

    $("#editModal").modal('show');
  }

  onSubmitUpdate() {
    this.IsEditOrganizationFormValid = true;
    if (this.editOrganizationForm.invalid) {
      return;
    } else {
      var data = this.editOrganizationForm.value;
      data.id = this.editedOrg._id;

      this.commonService.PostAPI(`${this.slug}organization/update`, data).then((response: any) => {
        if (response.status) {
          this.getOrganizations();
          $("#editModal").modal('hide');
          this.toastr.success(response.message, 'Success');
        } else {
          this.toastr.error(response.message, 'Error');
        }
      });
    }
  }

  reset() {
    this.IsAddOrganizationFormValid = false;
    this.addOrganizationForm.reset();
  }

  updateOrgStatus(e, organization_id) {
    var status: number;

    if (e.target.checked) {
      status = 0;
    } else {
      status = 1;
    }

    this.commonService.PostAPI(`${this.slug}organization/update/status`, {
      status: status,
      id: organization_id
    }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, 'Success');
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

}
