import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";

declare var $: any;

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  public organizations: any;
  public roles: any = [];
  public levels: any = [];

  addRoleForm: FormGroup;
  editRoleForm: FormGroup;

  IsaddRoleFormValid = false;
  IsEditRoleFormValid = false;

  currentuser;
  editedRole: any = [];

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

    this.addRoleForm = this.formBuilder.group({
      organization_id: ['', Validators.required],
      level_id: ['', Validators.required],
      role_name: ['', Validators.required]
    });

    this.editRoleForm = this.formBuilder.group({
      organization_id: ['', Validators.required],
      level_id: ['', Validators.required],
      role_name: ['', Validators.required]
    });

    this.getOrganizations();
    this.getRoles();
  }

  get jval() {
    return this.addRoleForm.controls;
  }

  get editRole() {
    return this.editRoleForm.controls;
  }

  submit() {
    this.IsaddRoleFormValid = true;
    if (this.addRoleForm.invalid) {
      return;
    } else {
      const data = this.addRoleForm.value;

      this.commonService.PostAPI(`${this.slug}organization/role/create`, data).then((response: any) => {
        if (response.status) {
          $("#myModal").modal('hide');
          this.toastr.success(response.message, "Success");
          this.getRoles();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  getOrganizations() {
    this.commonService.GetAPI(`${this.slug}organization/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.organizations = response.data;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  getLevels(organization_id) {
    this.commonService.PostAPI(`${this.slug}level/get/by/organization`, { organization_id: organization_id }).then((response: any) => {
      if (response.status) {
        this.levels = response.data;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  loadDatatables() {
    setTimeout(function () { $('#example').dataTable() }, 1000);
  }

  getRoles() {
    this.commonService.GetAPI(`${this.slug}organization/role/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.roles = response.data;
        this.loadDatatables();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  openEditModal(role) {
    this.editedRole = role;

    this.editRoleForm.setValue({
      organization_id: role.organization_id,
      level_id: role.level_id,
      role_name: role.role_name
    });

    $("#editRole").modal('show');
  }

  onSubmitUpdate() {
    this.IsEditRoleFormValid = true;
    if (this.editRoleForm.invalid) {
      return;
    } else {
      var data = this.editRoleForm.value;
      data.id = this.editedRole._id;

      this.commonService.PostAPI(`${this.slug}organization/role/update`, data).then((response: any) => {
        if (response.status) {
          this.getRoles();
          $("#editRole").modal('hide');
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  reset() {
    this.IsaddRoleFormValid = false;
    this.addRoleForm.reset();
  }
}
