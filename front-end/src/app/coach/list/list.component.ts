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
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  searchCoachesForm: FormGroup;
  isSearchCoachesFormValid = false;

  users: any = [];

  currentuser;
  currentUserId;
  parent_user_id: any;

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

  faqData: any = [
    {
      topic: "Where do I begin?",
      answer: "Getting started is simple, just make sure you are under the CREATE stage, and make a root plan item"
    },
    {
      topic: "What are production and expense thresholds?",
      answer: `While not applicable to ALL users, many users find themselves wanting 
      to be alerted when their plans may be below or above production and
       expense targets respectively.`
    },
    {
      topic: "I went to create a sub-item and forgot to include production and expense values, what do I do?",
      answer: `Relax, Rapifly has a built-in edit feature that allows you to quickly
      update and maintain any sub-items; however, we do NOT allow the modification
      of any root items. While this feature is being considered for the future, we are
      focused on maintaining solid security standards that protect the end-user from
      malicious acts.`
    },
    {
      topic: "How can I report a bug?",
      answer: `No problem, if you return to the CREATE stage under the HUD, you'll notice
      a purple bug icon. Clicking this button will bring up a form that will allow you to report bugs as well
      as suggest new features and express constructive criticism.`
    }
  ]

  hudSelectionsPhases_Create: any = [
    'Brainstorm',
    'Prioritize',
    'Deactivate',
    'Propose',
    'Vote',
    'Select'
  ]

  hudSelectionsPhases_Execute: any = [
    'Delegate',
    'Countdown',
    'Launch'
  ]

  hudSelectionPhases_Evaluate: any = [
    'Report',
    'Measure',
    'Improve'
  ]

  hudSelectionsStages: any = [
    'Create',
    'Execute',
    'Evaluate'
  ]

  hudSelectionsChallenges: any = [
    'Opportunity',
    'Problem'
  ]

  hudSelectionsModules: any = [
    'Strategy',
    'Process',
    'Motive',
    'Analysis',
    'Intelligence'
  ]

  adminSelectionsMain: any = [
    'User',
    'Project',
    'Security',
    'Team'
  ]

  activeStage: String = "";
  activeStageAdmin: String = "";
  activePhase: String = "";

  ngOnInit() {
    this.searchCoachesForm = this.formBuilder.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      phone: [''],
      title: [''],
      company_name: [''],
      industries: [''],
    });

    this.getUsers();
  }

  selectPhase(event){
    this.activePhase = event.target.value
  }
  selectStage(event){
    this.activeStage = event.target.value
  }
  selectStageAdmin(event){
    this.activeStageAdmin = event.target.value
  }
  getUsers() {
    this.commonService.PostAPI(`coach/get/all`, {}).then((response: any) => {
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

  resetTable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
      });
    });
  }

  openSearchModal() {
    $("#searchCoachModal").modal('show');
  }
  
  closeSearchModal() {
    $("#searchCoachModal").modal('hide');
  }

  submit() {
    this.isSearchCoachesFormValid = true;

    if (this.searchCoachesForm.invalid) {
      return;
    } else {
      var data = this.searchCoachesForm.value;

      this.commonService.PostAPI(`coach/filter`, data).then((response: any) => {
        if (response.status) {
          this.users = response.data;
        } else {
          this.users = [];
        }

        this.closeSearchModal();

        this.resetTable();
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



  resetSearch(){
    this.resetTable();
    this.getUsers();
  }
}
