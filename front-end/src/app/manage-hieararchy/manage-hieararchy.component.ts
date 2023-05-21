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
  selector: 'app-manage-hieararchy',
  templateUrl: './manage-hieararchy.component.html',
  styleUrls: ['./manage-hieararchy.component.css']
})
export class ManageHieararchyComponent implements OnInit {

  designationForm: FormGroup;
  designationSubmitted: boolean = false;

  public hierarchy: any = [];
  public editedHierarchy: any = [];

  currentuser;
  currentUserId;
  parent_user_id: any;
  hierarchyId: any;
  superiorDesignations: any = [];
  selectedDesignation: any;

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
    this.designationForm = this.formBuilder.group({
      designation: ['', Validators.required],
      superior_designation: [''],
    });

    this.getHierarchy();
  }

  get pval() {
    return this.designationForm.controls;
  }

  getHierarchy() {
    this.dtOptions = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };

    if (this.currentuser.role === 'Admin') {
      this.commonService.PostAPI(`hierarchy/designation/by/parent`, { parent_user_id: this.parent_user_id }).then((response: any) => {
        if (response.status && response.data && response.data.length > 0) {
          this.hierarchy = response.data;
        } else {
          this.hierarchy = [];
        }

        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      });
    } else if (this.currentuser.role === 'User') {
      this.commonService.PostAPI(`hierarchy/designation/by/user`, { user_id: this.currentUserId }).then((response: any) => {
        if (response.status && response.data && response.data.length > 0) {
          this.hierarchy = response.data;
        } else {
          this.hierarchy = [];
        }
        this.dtTrigger.next();
        this.dataTableAfterViewInit();
      });
    }
  }

  loadDatatables() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });

    this.getHierarchy();
  }

  openModal() {
    $("#myModal").modal("show");
  }

  closeModal() {
    $("#myModal").modal("hide");
  }

  editDesignation(element) {
    this.editedHierarchy = element;
    this.getDesignations();
    this.getParentDesignation();

    this.designationForm.setValue({
      designation: this.editedHierarchy[0],
      superior_designation: ''
    })

    this.openModal();
  }

  getDesignations() {
    this.commonService.PostAPI(`hierarchy/get/all/designation`, { hierarchy_id: this.editedHierarchy[2], parent_user_id: this.parent_user_id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.superiorDesignations = response.data;
      } else {
        this.superiorDesignations = [];
      }
    });
  }

  getParentDesignation() {
    this.commonService.PostAPI(`hierarchy/get/parent/designation`, { hierarchy_id: this.editedHierarchy[2] }).then((response: any) => {
      if (response.status && response.data) {
        this.selectedDesignation = response.data;
      } else {
        this.superiorDesignations = '';
      }
    });
  }

  renameDesignation() {
    this.designationSubmitted = true;

    if (this.designationForm.invalid) {
      return;
    }

    var data = this.designationForm.value;
    data._id = this.editedHierarchy[2];
    data.parent_hierarchy_id = this.selectedDesignation._id;

    this.commonService.PostAPI(`hierarchy/update/designation`, data).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.loadDatatables();
        this.closeModal();
      } else {
        this.toastr.error(response.message, "Error");
        this.closeModal();
      }
    });
  }

  openConfirmModal() {
    $("#confirmModal").modal("show");
  }

  closeConfirmModal() {
    $("#confirmModal").modal("hide");
  }

  confirmDeleteDesignation(hierarchy_id) {
    this.hierarchyId = hierarchy_id;
    this.openConfirmModal();
  }

  deleteDesignation() {
    this.commonService.PostAPI(`hierarchy/delete`, { hierarchy_id: this.hierarchyId }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.loadDatatables();
      } else {
        this.toastr.error(response.message, "Error");
      }

      this.closeConfirmModal();
    });

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

  onChange(e) {
    this.selectedDesignation = e;
  }

}
