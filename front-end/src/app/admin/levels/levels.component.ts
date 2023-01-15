import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";

declare var $: any;

@Component({
  selector: 'app-levels',
  templateUrl: './levels.component.html',
  styleUrls: ['./levels.component.css']
})

export class LevelsComponent implements OnInit {

  public organizations: any;
  public levels: any = [];
  addLevelForm: FormGroup;
  editLevelForm: FormGroup;

  IsAddLevelFormValid = false;
  IsEditLevelFormValid = false;

  currentuser;
  editedLevel: any = [];


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

    this.addLevelForm = this.formBuilder.group({
      organization_id: ['', Validators.required],
      level_priority: ['', Validators.required],
      level_name: ['', Validators.required]
    });

    this.editLevelForm = this.formBuilder.group({
      organization_id: [{value: '', disabled: true}, Validators.required],
      level_priority: [{value: '', disabled: true}, Validators.required],
      level_name: ['', Validators.required]
    });

    this.getOrganizations();
    this.getLevels();
  }

  get jval() {
    return this.addLevelForm.controls;
  }

  get editLevel() {
    return this.editLevelForm.controls;
  }

  submit(form) {
    this.IsAddLevelFormValid = true;
    if (this.addLevelForm.invalid) {
      return;
    } else {
      var data = this.addLevelForm.value;

      this.commonService.PostAPI(`level/create`, data).then((response: any) => {
        if (response.status) {
          $("#myModal").modal('hide');
          this.toastr.success(response.message, "Success");
          this.getLevels();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  getOrganizations() {
    this.commonService.GetAPI(`organization/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.organizations = response.data;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  loadDatatables() {
    setTimeout(function () { $('#example').dataTable() }, 1000);
  }

  getLevels() {
    this.commonService.GetAPI(`level/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.levels = response.data;
        this.loadDatatables();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  openEditModal(level) {
    this.editedLevel = level;

    this.editLevelForm.setValue({
      organization_id: level.organization_id,
      level_priority: level.level_priority,
      level_name: level.level_name
    });

    $("#editLevels").modal('show');
  }

  onSubmitUpdate() {
    this.IsEditLevelFormValid = true;
    if (this.editLevelForm.invalid) {
      return;
    } else {
      var data = this.editLevelForm.value;
      data.id = this.editedLevel._id;

      this.commonService.PostAPI(`level/update`, data).then((response: any) => {
        if (response.status) {
          this.getLevels();
          $("#editLevels").modal('hide');
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  reset() {
    this.IsAddLevelFormValid = false;
    this.addLevelForm.reset();
  }

}
