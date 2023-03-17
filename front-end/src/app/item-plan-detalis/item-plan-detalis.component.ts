import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import { DataTableDirective } from "angular-datatables";
import { first } from "rxjs/operators";
import { Subject } from "rxjs";
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common'
import * as moment from 'moment';
import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
import { ChartConfiguration, ChartData, ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Color, Colors, Label } from 'ng2-charts';

declare var $: any;

@Component({
  selector: 'app-item-plan-detalis',
  templateUrl: './item-plan-detalis.component.html',
  styleUrls: ['./item-plan-detalis.component.css']
})
export class ItemPlanDetailsComponent implements OnInit {

  childPlanForm: FormGroup;
  submitted: boolean = false;

  DiscussionForm: FormGroup;
  isSubmittedDiscussionForm: boolean = false;
  discussionAttachments: any = [];

  productionSum: Number
  expenseSum: Number

  cdInterval: any;
  moduleItemActive: Boolean = false;
  currentchildUser
  currentuser;
  planId;
  currentparentUser
  planteeDetails: any = [];
  parentplanDetails: any = [];
  childgoalDetails: any = [];
  finalarray = [];
  alertdata;
  childParentId: String = ""

  currentModuleDetails: any;
  // FEEDBACK
  feedbackModalOpen: boolean = false;
  keepGetStartedOpenOnVist: boolean;

  goalid;
  goalplanid;
  checkforgoaledit = false
  parentIsActiveSelection: boolean;

  initGrabCD: boolean = false;
  pparentplanDetails;
  planstartdate;
  planenddate;
  golaplanname;

  goalReportDetails: any = '';
  planHudDetails: any;

  files: any = [];
  attachments: File[] = [];

  goalAttachments: any = [];
  sharedPlanPermission: any = [];
  isSharedPlanPermission: boolean = false;

  items = [];
  selected = [];

  selectedPhase: any = 'B';
  selectedStage: any = 'create';

  // Deactivate
  goals: any = [];
  high: any = [];
  low: any = [];
  medium: any = [];
  dividearrayintothreepart: any = 0;

  //priority
  isDevidedInParts: any = 0;
  priorityGoals: any = []
  highPriorityGoals: any = []
  lowPriorityGoals: any = []
  mediumPriorityGoals: any = []

  // Propose
  isProposeDevidedInParts: number = 0;
  checkboxshow: boolean = false;
  proposeGoals: any = []
  highProposeGoals: any = []
  lowProposeGoals: any = []
  mediumProposeGoals: any = []


  // Edit Mode
  editChildEnabled: boolean = false;

  // DataTables
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  // Vote
  voteGoals: any = [];
  dtOptionsVote: DataTables.Settings = {};
  dtTriggerVote: Subject<any> = new Subject();

  // Select
  selectGoals: any = [];
  plansecurity: any;
  dtOptionsSelect: DataTables.Settings = {};
  dtTriggerSelect: Subject<any> = new Subject();

  // Delegate
  delegateGoals: any = [];
  dtOptionsDelegate: DataTables.Settings = {};
  dtTriggerDelegate: Subject<any> = new Subject();

  DelegateForm: FormGroup;
  isDelegateFormSubmitted: boolean = false;

  childuser: any = [];
  goalname: any;
  delegateGoalId: any;
  goalDelegateData: any = [];
  totalgoalacceptpercentage: number = 0;
  totalgoalrejectpercentage: number = 0;
  totalgoalpendingpercentage: number = 0;
  totalgoalpercentage: number = 0;
  showdelegatform: boolean = false;
  delegatedGoals: any = [];

  //Countdown
  countdownGoals: any = [];
  dtOptionsCountdown: DataTables.Settings = {};
  dtTriggerCountdown: Subject<any> = new Subject();

  //Launch
  launchGoals: any = [];
  dtOptionsLaunch: DataTables.Settings = {};
  dtTriggerLaunch: Subject<any> = new Subject();

  //Report
  reportGoals: any = [];
  dtOptionsReport: DataTables.Settings = {};
  dtTriggerReport: Subject<any> = new Subject();
  reportGoalId: any;
  reportId: any;
  reportDetail: any;

  //All Goals by Plan
  planGoals: any = [];
  dtOptionsPlanGoals: DataTables.Settings = {};
  dtTriggerPlanGoals: Subject<any> = new Subject();

  ReportForm: FormGroup;
  isReportFormSubmitted: boolean = false;

  // Measure
  hoveredDate: NgbDate;
  fromDate;
  toDate;
  actualExpenseSum: Number;
  actualProductionSum: Number;
  prodHierarchy: any = [];
  expHierarchy: any = [];
  chartRendered: Boolean = false;

  planDetails: any = [];
  isDetailsFound: boolean = false;

  startDate: any = '';
  endDate: any = '';

  tableId: any;

  datasetProd: any = []
  datasetExp: any = []
  datasetTotal: any = []
  public lineChartMainLabels: Label[] = []
  public lineChartMainConfigData: ChartDataSets[] = this.datasetTotal
  public lineChartMainOptions: Colors[] = [
    { // red (NEC FOR BLANK SLOT BUG FIX)
      backgroundColor: ['#5cb85c50'],
      borderColor: 'white',
    },
    
    { // red (NEC FOR BLANK SLOT BUG FIX)
      backgroundColor: ['#bb212450'],
      borderColor: 'red',
    },

  ]


  public centralLabel: any = '';
  public canvasWidth = 400
  public needleValue = 0;
  public name = 'Expected Target'
  public bottomLabel = '0'
  public options = {
    hasNeedle: true,
    needleColor: '#F0F4F2',
    needleUpdateSpeed: 1000,
    arcColors: ['#FF4A4E', '#7BFF75'],
    arcDelimiters: [30],
    rangeLabel: ['0', '0'],
    needleStartValue: 50,
  }
  

  chartIsLoaded: Boolean = false;

  public review_needleValue = 0;
  public review_name = 'Revenue Target'
  public review_bottomLabel = '0'
  public review_options = {
    hasNeedle: true,
    needleColor: '#F0F4F2',
    needleUpdateSpeed: 1000,
    arcColors: ['#FF4A4E', '#7BFF75'],
    arcDelimiters: [30],
    rangeLabel: ['0', '0'],
    needleStartValue: 50,
  }

  // Modules
  selectedModules: any = '';
  isSelectedChallange: boolean = false;

  ModuleForm: FormGroup;
  ModuleFormSub: FormGroup;
  isModuleFormSubmitted: boolean = false;

  opportunityDetails: any = [];
  problemDetails: any = [];

  moduleGoals: any = [];
  dtOptionsModule: DataTables.Settings = {};
  dtTriggerModule: Subject<any> = new Subject();

  moduleAttachments: any = [];

  selectedPanel: any = "";
  plans: any = [];

  hierarchyDetails: any;

  title = '';
  type = 'OrgChart';
  userHierarchyData = [];
  columnNames = ["Name", "Manager", "Tooltip"];
  option = {
    allowHtml: true,
  };
  width = "500";
  height = "500";

  FeedbackForm: FormGroup;
  InviteUserForm: FormGroup;
  isInviteUserFormValid = false;

  selectedUser: any;
  currentUrl: any;

  parentplangroup: FormGroup;
  IsLoginFormValid = false;
  editid;
  plansDetails: any = [];
  action;
  userid;
  showcustomtag = false;

  // SECOND CHILD PROFILE
  childPlanFormSub: FormGroup;

  // USER STATS

  totalParentProfiles: Number; 
  totalProfiles: Number;
  totalDelegatedTasks: Number;
  launchedProfiles: Number;
  reportedProfiles: Number;
  queuedForLaunch: Number;

  savedContacts: any = [];

  //Multiselect Dropdown
  // items = [];
  // selected = [];
  selectedUsers = [];
  users: any = [];
  selectedModItem: boolean = false;
  final = [];
  datafinal = this.final;

  childUsers: any = [];
  childUsersList: any = [];

  selectedSharedPlanUser: any = [];

  coachesDetails: any = [];
  dtOptionsCoaches: DataTables.Settings = {};
  dtTriggerCoaches: Subject<any> = new Subject();

  moduleType: any = 'goal';
  moduleDetails: any = [];

  // Invite User
  designations: any = [];

  inviteUserForm: FormGroup;

  selectedDomain: any = '';

  currentUserId;
  parent_user_id: any;
  instructionBoxOpen: Boolean = false;


  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;


  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public platformLocation: PlatformLocation,
    private ref: ChangeDetectorRef
  ) {
    this.currentUrl = (this.platformLocation as any).location.origin;
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    this.keepGetStartedOpenOnVist = this.currentuser.instructionBoxOpen
    this.currentUserId = this.currentuser.user._id;
    if (this.currentuser.role == "Admin" || this.currentuser.role == "User") {
      this.parent_user_id = this.currentuser.user._id;
    } else {
      this.parent_user_id = this.currentuser.user.parent_user_id;
    }

    this.currentchildUser = JSON.parse(window.localStorage.getItem("currentchildUser"));
    this.currentparentUser = JSON.parse(window.localStorage.getItem("currentparentUser"));
    if (!this.currentuser.user.passwordChanged) {
      this.router.navigate(['/profile'])
    }
    this.userid = this.currentuser.user._id;
    this.toDate = calendar.getToday();
    this.fromDate = calendar.getPrev(calendar.getToday(), 'm', 1);
  }

  // formfield = [{ name: '', type: '', required: '', label: '', value: '', userid: this.userid }]
  formfield = [{ name: '', type: '', required: '', label: '', value: '', userid: '' }]
  selectoption = [{ id: '' }]
  data = [{}]

  ngOnInit() {
    var a = this;
   
    this.route.queryParams.subscribe(params => {
      if (params && params.stage && params.stage != '') {
        this.selectPanel(params.stage);
      } else {
        this.selectPanel('project')
      }
      if (params && params.phase && params.phase != '') {
        this.planId = params.planId;
        this.getplandetail(params.planId);
        this.getHeadUpToDisplayDetails(params.planId);
      }
    });

    this.getPlanDetails();
    this.launchgoalalert();
    this.getDesignations();
    
    $(function () {
      $('button').on('click', function () {
        $('#jstree').jstree(true).select_node('child_node_1');
        $('#jstree').jstree('select_node', 'child_node_1');
        $.jstree.reference('#jstree').select_node('child_node_1');
      });
    });

    this.childPlanForm = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      shared_users: [''],
      production_target: [''],
      production_type: [''],
      production_low_variance_alert: [''],
      production_high_variance_alert: [''],
      production_weight: [''],
      expense_target: [''],
      expense_low_variance_alert: [''],
      expense_high_variance_alert: [''],
      expense_weight: [''],
    });

    this.childPlanFormSub = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      shared_users: [''],
      production_target: [''],
      production_type: [''],
      production_low_variance_alert: [''],
      production_high_variance_alert: [''],
      production_weight: [''],
      expense_target: [''],
      expense_low_variance_alert: [''],
      expense_high_variance_alert: [''],
      expense_weight: [''],
    })
    // Module
    this.ModuleForm = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      // supervisor: ['', Validators.required],
      // department: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      description: [''],
      production_target: [0],
      production_high_variance_alert: [0],
      production_low_variance_alert: [0],
      production_weight: [0],
      expense_target: [0],
      expense_high_variance_alert: [0],
      expense_low_variance_alert: [0],
      expense_weight: [0],
      security: ['public'],
      question: [''],
      answer: [''],
      source: [''],
      link: [''],
      intelligence_value: [''],
      intelligence_response: [''],
      attachments: ['']
    });
    this.ModuleFormSub = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      // supervisor: ['', Validators.required],
      // department: ['', Validators.required],
      description: [''],
      production_target: [0],
      production_high_variance_alert: [0],
      production_low_variance_alert: [0],
      production_weight: [0],
      expense_target: [0],
      expense_high_variance_alert: [0],
      expense_low_variance_alert: [0],
      expense_weight: [0],
      security: ['public'],
      question: [''],
      answer: [''],
      source: [''],
      link: [''],
      intelligence_value: [''],
      intelligence_response: [''],
      attachments: ['']
    });

    this.FeedbackForm = this.formBuilder.group({
      'subject': [''],
      'section': [''],
      'feedback_message': [''],
      'overall_rating': [''],
      'share_rating': ['']
    })

    this.InviteUserForm = this.formBuilder.group({
      'user_id': ['', Validators.required],
      'first_name': ['', Validators.required],
      'last_name': ['', Validators.required],
      'designation': ['', Validators.required],
      'email': ['', [Validators.required, Validators.email]],
    });

    this.DiscussionForm = this.formBuilder.group({
      'recipient_id': ['', Validators.required],
      'security': ['', Validators.required],
      'subject': ['', Validators.required],
      'message': ['', Validators.required],
    });

    var today, datepicker;

    $('#date-input5').datepicker({
      setDate: new Date(),
      todayHighlight: true,
      startDate: '-0m',
      minDate: 0,
    });
    $('#date-input6').datepicker({
      setDate: new Date(),
      todayHighlight: true,
      startDate: '-0m',
      minDate: 0,
    });
    $('#date-input5').datepicker().on('changeDate', function (e) {
      $('#date-input5').datepicker('hide');
    });
    $('#date-input6').datepicker().on('changeDate', function (e) {
      $('#date-input6').datepicker('hide');
    });

    this.getUserSharePlanPermission();

    // Vote
    this.dtOptionsVote = {
      columnDefs: [{ orderable: false, targets: [1] }],
      pagingType: "full_numbers",
      pageLength: 10,
    };
    this.dtTriggerVote.next();

    // Select
    this.dtOptionsSelect = {
      columnDefs: [{ orderable: false, targets: [1] }],
      pagingType: "full_numbers",
      pageLength: 10
    };
    this.dtTriggerSelect.next();

    // Delegate
    this.getallchild();

    this.dtOptionsDelegate = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerDelegate.next();

    this.DelegateForm = this.formBuilder.group({
      child_user_id: ['', Validators.required],
      percentage: ['', Validators.required],
      description: ['', Validators.required],
    });

    // Countdown
    this.dtOptionsCountdown = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerCountdown.next();

    // Launch
    this.dtOptionsLaunch = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerLaunch.next();

    // Report
    this.dtOptionsReport = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerReport.next();

    this.ReportForm = this.formBuilder.group({
      actual_production: ['', Validators.required],
      actual_expense: ['', Validators.required],
    });

    // Module
    this.dtOptionsModule = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerModule.next();

    // Plan Goals
    this.dtOptionsPlanGoals = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerPlanGoals.next();

    // Caoches Corner
    this.dtOptionsCoaches = {
      columnDefs: [
        { orderable: false, targets: [1] }
      ],
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.dtTriggerCoaches.next();

    this.getUserRole();
    this.getChildUsers();



    this.data[0]["numbers"] = [''];
    this.data[0]["short_name"] = ['', Validators.required];
    this.data[0]["long_name"] = ['', Validators.required];
    this.data[0]["description"] = [''];
    this.data[0]["start_date"] = ['', Validators.required];
    this.data[0]["end_date"] = ['', Validators.required];
    this.data[0]["security"] = ['0', Validators.required];
    this.data[0]["share_users"] = [''];
    this.data[0]["production_target"] = [''];
    this.data[0]["production_type"] = [''];
    this.data[0]["production_low_variance_alert"] = [''];
    this.data[0]["production_high_variance_alert"] = [''];
    this.data[0]["production_weight"] = [''];
    this.data[0]["expense_target"] = [''];
    this.data[0]["expense_low_variance_alert"] = [''];
    this.data[0]["expense_high_variance_alert"] = [''];
    this.data[0]["expense_weight"] = [''];

    this.parentplangroup = this.formBuilder.group(this.data[0]);

    this.parentplangroup.get('security').setValue('0');
    $('#date-input5').on('changeDate', function (ev) {
      $(this).datepicker('hide');
    });
    $('#date-input6').on('changeDate', function (ev) {
      $(this).datepicker('hide');
    });

    // Invite User
    this.inviteUserForm = this.formBuilder.group({
      hierarchy_id: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    // this.getInviteDesignations();


  }

  
  toggleInstructionBoxOpenOnVisit(){
    this.keepGetStartedOpenOnVist = false
    this.commonService.PostAPI(`users/update/insBoxView`, {
      user_id: this.currentUserId,
      instructionBoxOpen: this.keepGetStartedOpenOnVist
    }).then((res: any)=>{
      if(res.status){
        return;
      }
      else {
        return;
      }
    })
  }

  throwToastrError(message: string){
    return this.toastr.error(message)
  }

  toggleInstructionBox(){
    this.toggleInstructionBoxOpenOnVisit()
    this.instructionBoxOpen = !this.instructionBoxOpen
    if (!this.instructionBoxOpen){
      this.keepGetStartedOpenOnVist = this.currentuser.instructionBoxOpen
    }
  }

  // FEEDBACK FUNCTIONALITY
  openFeedbackModal() {
    this.feedbackModalOpen = !this.feedbackModalOpen;
  }

  clearFeedback() {
    this.FeedbackForm.reset()
  }

  SubmitFeedback(){
    let data = this.FeedbackForm.value
    let subject = data.subject;
    let section = data.section;
    let feedback_message = data.feedback_message;
    let overall_rating = data.overall_rating;
    let share_rating = data.share_rating;

    this.commonService.PostAPI(`users/feedback`, {
      user_id: this.currentUserId,
      subject: subject,
      section: section,
      feedback_message: feedback_message,
      overall_rating: overall_rating,
      share_rating: share_rating
    }).then((response: any)=>{
      if(response.status){
        this.toastr.success(response.message, 'Success')
      }
      else {
        this.toastr.error(response.message, 'Error')
      }
    }).finally(()=>{
      this.feedbackModalOpen = false
      this.FeedbackForm.reset()
    })
  }


  // getInviteDesignations() {
  //   if (this.currentuser.role == "Admin") {
  //     this.commonService.PostAPI(`hierarchy/get/designation`, { parent_user_id: this.parent_user_id }).then((response: any) => {
  //       if (response.status) {
  //         this.designations = response.data;
  //       } else {
  //         this.toastr.error(response.message, 'Error');
  //       }
  //     });
  //   } else {
  //     this.commonService.PostAPI(`hierarchy/get/child/designation`, { user_id: this.currentUserId }).then((response: any) => {
  //       if (response.status) {
  //         this.designations = response.data;
  //       } else {
  //         this.toastr.error(response.message, 'Error');
  //       }
  //     });
  //   }
  // }

  onRecipient(e) {
    if (e.target.value && e.target.value === "invite") {
      this.DiscussionForm.get('recipient_id').setValue('')
      $("#inviteModal").modal("show");
    }
  }
  
  deletePlanById(plan) {
    this.commonService.PostAPI(`plan/delete`, {
      plan_id: plan,
      user_id: this.currentUserId
    }).then((res: any)=>{
      if (res.status) {
        this.getPlanDetails()
        this.selectPhase("project")
        this.toastr.success(res.message, "Success")
      }
      else {
        this.toastr.error(res.message, "Error")
      }
    })
  }

  //For validation
  get formVal() {
    return this.inviteUserForm.controls;
  }
  
  submit() {
    this.isInviteUserFormValid = true;
    
    if (this.inviteUserForm.invalid) {
      return;
    } else {
      var data = this.inviteUserForm.value;

      data.current_url = this.currentUrl;
      data.invited_by_user_id = this.currentuser.user._id;
      data.parent_user_id = this.parent_user_id;

      $("#inviteModal").modal("hide");

      this.commonService.PostAPI(`users/invite`, data).then((response: any) => {
        if (response.status) {
          this.inviteUserForm.reset();
          this.isInviteUserFormValid = false;
          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  // Project Tree Builder Present in Function

  getPlanDetails() {
    // Used for building tree
    this.finalarray = [];

    // I HATE THIS, PUN NOT INTENDED, WHO USES THIS SYNTAX?!
    var a = this;

    // Unknown array currently
    if (this.currentchildUser == null) {
      this.currentchildUser = []
    }
    if (this.currentparentUser == null) {
      this.currentparentUser = []
    }

    // Summon children of the corn? WTH does this do?
    // Currently an empty array when init page?
    var children = this.currentchildUser.concat(this.currentparentUser);


    this.commonService.PostAPI('goal/plangoal/tree', { id: this.currentuser.user._id, childids: children }).then((response: any) => {
      if (response.status) {

        // Misspelling present, but this is where the tree details seem to build?
        this.planteeDetails = response.data;

        // Map through resp
        this.planteeDetails.forEach(element => {
          console.log(element)
          // That array from above
          // For root items
          this.finalarray.push({ "id": element._id, "parent": "#", "text": element.short_name, 'state': { 'opened': true }, "icon": "assets/images/avatars/p.png" })
          
          // This must be sub-children
          element.goals.forEach(element2 => {
            let parsedArr = element2.parent_goal_id
            if (element2.module_type == 'goal') {
              if (parsedArr[parsedArr.length - 1] !== '#'){
                var moduleTypeIcon: any = "assets/images/avatars/g.png";
                this.finalarray.push({ "id": element2._id, "parent": parsedArr[parsedArr.length - 1], "text": element2.short_name, "icon": moduleTypeIcon })
              }
              else {
                var moduleTypeIcon: any = "assets/images/avatars/g.png";
                this.finalarray.push({ "id": element2._id, "parent": element._id, "text": element2.short_name, "icon": moduleTypeIcon })
              }
            }})
        });

        // ONCLICK FUNCTIONALITY FOR PROJECT TREE
        $('#jstree').jstree("destroy");
        $("#jstree").on("select_node.jstree",
          function (evt, data) {
            var plan_id;

            // PREVENTS EDIT UI
            a.editChildEnabled = false;
            a.chartRendered = false;
            // ROOT ITEM
            if (data.node.parent == "#") {
              a.getplandetail(data.selected[0]);
              a.getGoalReportByPlan(data.selected[0]);
              plan_id = data.selected[0];
              a.parentIsActiveSelection = true;
            }
            
            // SUB ITEM LEVEL 1
            else if (data.node.parent !== '#' && data.node.parents.length > 3) {
              a.getgoaldetail(data.selected[0], data.node.parent);
              a.getGoalReportByPlan(data.node.parent);
              a.parentIsActiveSelection = false;
              plan_id = data.node.parent;
              a.goalid = ""
              a.childParentId = data.node.parent
              a.getGoalAttachments(data.selected[0]);
              a.getGoalSharedUsers(data.selected[0]);
              a.checkPlanForGoalSharePermission(plan_id);
            }

            // SUB ITEM LEVEL n+1
            else {
              a.getgoaldetail(data.selected[0], data.node.parent);
              a.getGoalReportByPlan(data.node.parent);
              a.parentIsActiveSelection = false;
              plan_id = data.node.parent;
              a.childParentId = data.node.parent
              a.goalid = data.selected[0]
              a.getGoalAttachments(data.selected[0]);
              a.getGoalSharedUsers(data.selected[0]);
              a.checkPlanForGoalSharePermission(plan_id);
            }

            // CLEAN UP
            a.planId = plan_id;
            a.getHeadUpToDisplayDetails(plan_id);
            a.selectedPhase = 'B';
            a.selectedModules = '';
            a.moduleType = 'goal';
            a.showSelectedTree(a.selectedModules);
            a.getPlanGoals(data.selected[0]);
            a.dataTableAfterViewInit()
          }
        );

        // SETS PROJECT TREE W/ finalarray VAR
        $('#jstree').jstree({ core: { data: this.finalarray } });
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  sendForReport(event){
    this.commonService.PostAPI(`goal/getgoals/launch`, {
      user_id: this.currentUserId,
      isReportReady: true,
      goal_id: event.srcElement.id
    }).then((res: any)=>{
      if (res.status){
        return this.toastr.success(res.message, "Success")
      }
      else {
        return this.toastr.error(res.message, "Error")
      }
    })
    this.getLaunchGoals(this.planId)
  }

  getPlanGoals(planid) {
    this.commonService.PostAPI(`goal/getgoals/bypid`, { id: planid, module_type: this.moduleType }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.planGoals = response.data;
      } else {
        this.planGoals = [];
      }

      $("#table-goals").dataTable().fnDestroy();
      // this.dtTriggerPlanGoals.next();
      // this.dataTableAfterViewInit();
    });
  }

  getGoalAttachments(goal_id) {
    this.commonService.PostAPI(`goal/get/attachments`, { goal_id: goal_id }).then((response: any) => {
      if (response.status) {
        this.goalAttachments = response.data;
      } else {
        this.goalAttachments = []
      }
    });
  }

  getGoalSharedUsers(goal_id) {
    if (this.isSharedPlanPermission) {
      this.commonService.PostAPI(`goal/get/shared/users`, { goal_id: goal_id }).then((response: any) => {
        if (response.status) {
          if (response.data && response.data.length > 0) {
            var usersArr = [];

            response.data.forEach(element => {
              var data = {
                id: element.user_id._id,
                name: `${element.user_id.first_name} ${element.user_id.last_name} - ${element.hierarchy_id.designation}`
              };

              usersArr.push(data);
            });

            this.selected = usersArr;
          }
        }
      });
    }
  }

  getHeadUpToDisplayDetails(plan_id) {
    this.commonService.PostAPI(`plan/get/hud/details`, { plan_id: plan_id }).then((response: any) => {
      if (response.status) {
        this.planHudDetails = response.data;
      } else {
        this.planHudDetails = '';
      }
    });
  }

  toggleEditChild(){
    this.editChildEnabled = !this.editChildEnabled
  }

  getgoaldetail(goal, parent) {

    this.commonService.PostAPI(`goal/get/by/id`, { goal_id: goal }).then((response: any) => {
      if (response.status) {
        this.childgoalDetails = response.data;
        if (this.currentuser.user._id == this.childgoalDetails.user_id) {
          this.checkforgoaledit = true;
        } else {
          this.checkforgoaledit = false;
        }
        this.moduleType = this.childgoalDetails.module_type;
        if (this.childgoalDetails.parent_goal_id !== '#'){
          this.goalid = this.childgoalDetails.parent_goal_id
        }
        else {
          this.goalid = this.childgoalDetails._id
        }
        // this.goalplanid = parent;
        // this.getplandetail2(parent);

        var datePipe = new DatePipe("en-US");
        $('#date-input5').datepicker('setDate', datePipe.transform(this.childgoalDetails.start_date, 'MM/dd/yyyy'));
        $('#date-input6').datepicker('setDate', datePipe.transform(this.childgoalDetails.end_date, 'MM/dd/yyyy'));

        if(this.selectedModules === ''){
        this.childPlanForm.patchValue({
          short_name: this.childgoalDetails.short_name,
          long_name: this.childgoalDetails.long_name,
          description: this.childgoalDetails.description,
          start_date: datePipe.transform(this.childgoalDetails.start_date, 'MM/dd/yyyy'),
          end_date: datePipe.transform(this.childgoalDetails.end_date, 'MM/dd/yyyy'),
          expected_target: this.childgoalDetails.expected_target,
          revenue_target: this.childgoalDetails.revenue_target,
          shared_users: this.selected,
          production_target: this.childgoalDetails.production_target,
          production_type: this.childgoalDetails.production_type,
          production_low_variance_alert: this.childgoalDetails.production_low_variance_alert,
          production_high_variance_alert: this.childgoalDetails.production_high_variance_alert,
          production_weight: this.childgoalDetails.production_weight,
          expense_target: this.childgoalDetails.expense_target,
          expense_low_variance_alert: this.childgoalDetails.expense_low_variance_alert,
          expense_high_variance_alert: this.childgoalDetails.expense_high_variance_alert,
          expense_weight: this.childgoalDetails.expense_weight,
        });
      }
      else {
        this.moduleItemActive = true;
        this.ModuleForm.patchValue({
          short_name: this.childgoalDetails.short_name,
          long_name: this.childgoalDetails.long_name,
          description: this.childgoalDetails.description,
          start_date: datePipe.transform(this.childgoalDetails.start_date, 'MM/dd/yyyy'),
          end_date: datePipe.transform(this.childgoalDetails.end_date, 'MM/dd/yyyy'),
          expected_target: this.childgoalDetails.expected_target,
          revenue_target: this.childgoalDetails.revenue_target,
          shared_users: this.selected,
          production_target: this.childgoalDetails.production_target,
          production_type: this.childgoalDetails.production_type,
          production_low_variance_alert: this.childgoalDetails.production_low_variance_alert,
          production_high_variance_alert: this.childgoalDetails.production_high_variance_alert,
          production_weight: this.childgoalDetails.production_weight,
          expense_target: this.childgoalDetails.expense_target,
          expense_low_variance_alert: this.childgoalDetails.expense_low_variance_alert,
          expense_high_variance_alert: this.childgoalDetails.expense_high_variance_alert,
          expense_weight: this.childgoalDetails.expense_weight,
        })
      }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  getplandetail(Plan) {
    this.checkforgoaledit = true
    this.commonService.PostAPI(`plan/get/by/id2`, { plan_id: Plan }).then((response: any) => {
      if (response.status) {

        this.parentplanDetails = response.data;
        if(this.parentIsActiveSelection){
          this.goalid = ""
        }
        this.planstartdate = this.parentplanDetails[0].start_date;
        this.planenddate = this.parentplanDetails[0].end_date;
        this.goalplanid = this.parentplanDetails[0]._id;
        this.golaplanname = this.parentplanDetails[0].short_name;
        this.plansecurity = this.parentplanDetails[0].security;
        this.childPlanForm.reset();
        this.childPlanForm.get('production_type').setValue('units')
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  reset() {
    this.submitted = false;
    this.childPlanForm.reset();
    // this.parentplangroup.get('security').setValue(' ');
    this.attachments = [];
  }

  getplandetail2(Plan) {
    this.commonService.PostAPI(`plan/get/by/id2`, { plan_id: Plan }).then((response: any) => {
      if (response.status) {
        this.parentplanDetails = response.data;
        this.goalplanid = this.parentplanDetails[0]._id;
        this.planstartdate = this.parentplanDetails[0].start_date;
        this.planenddate = this.parentplanDetails[0].end_date;
        this.golaplanname = this.parentplanDetails[0].short_name;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.childPlanForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.childPlanForm.invalid) {
      return;
    } else {
      if (this.goalplanid != undefined) {
        console.log($('#date-input5').val(), new Date(this.planstartdate).toDateString(), this.planenddate)
        if ($('#date-input5').val() != '' && $('#date-input6').val() != '') {
          if (new Date($('#date-input5').val()) > new Date($('#date-input6').val())) {
            this.toastr.error("Your start date is greater than End Date", "Error");
          } else {
            if (new Date(this.planstartdate).toDateString() <= new Date($('#date-input5').val()).toDateString() && new Date(this.planenddate).toDateString() >= new Date($('#date-input6').val()).toDateString()) {
              var data = this.childPlanForm.value;
              data.editid = this.childgoalDetails._id || "";
              data.user_id = this.currentuser.user._id;
              data.plan_id = this.goalplanid;
              data.status = 0;
              data.numbers = 0;
              data.start_date = $('#date-input5').val();
              data.end_date = $('#date-input6').val();
              data.shared_users = this.selected.map((data) => data.id);
              
              if (this.moduleType == '') {
                this.moduleType = 'goal';
              }

              data.module_type = this.moduleType;

              const formData: any = new FormData();
              const files: Array<File> = this.attachments;

              for (let i = 0; i < files.length; i++) {
                formData.append("attachments", files[i], files[i]['name']);
              }

              for (const key in data) {
                const element = data[key];
                formData.append(key.toString(), element);
                console.log(key, element)
              }

              this.commonService.PostAPI(`goal/create`, formData).then((response: any) => {
                if (response.status) {
                  this.toastr.success(response.message, "Success");
                  this.getPlanDetails();
                  this.getPlanGoals(this.goalplanid);
                  this.reset();
                } else {
                  this.toastr.error(response.message, "Error");
                  // this.is_disabled = false;
                }
              });
            } else {
              this.toastr.error("Your goal's start date and end date are outside of their parent plan range.", "Error");
            }
          }
        } else {
          if ($('#date-input5').val() == '') {
            this.toastr.error("Please Enter Start Date", "Error");
          } else if ($('#date-input6').val() == '') {
            this.toastr.error("Please Enter End Date", "Error");
          } else {

          }
        }
      } else {
        this.toastr.error("Please Select Project First!!", "Error");
      }
    }
  }

  onSubmitSub(){
    this.submitted = true;
    if (this.childPlanFormSub.invalid) {
      return;
    } else {
      if (this.goalplanid != undefined) {
        if ($('#date-input5').val() != '' && $('#date-input6').val() != '') {
          if (new Date($('#date-input5').val()) > new Date($('#date-input6').val())) {
            this.toastr.error("Your start date is greater than End Date", "Error");
          } 
          else {
              var data = this.childPlanFormSub.value;
              console.log(this.childgoalDetails)
              const parsedArr = this.childgoalDetails.parent_goal_id
              console.log(parsedArr)
              parsedArr.push(this.childgoalDetails._id)
              data.editid = "";
              data.parent_goal_id = parsedArr;
              data.user_id = this.currentuser.user._id;
              data.plan_id = this.goalplanid;
              data.status = 0;
              data.numbers = 0;
              data.start_date = $('#date-input5').val();
              data.end_date = $('#date-input6').val();
              data.shared_users = this.selected.map((data) => data.id);
              
              if (this.moduleType == '') {
                this.moduleType = 'goal';
              }

              data.module_type = this.moduleType;

              const formData: any = new FormData();
              const files: Array<File> = this.attachments;

              for (let i = 0; i < files.length; i++) {
                formData.append("attachments", files[i], files[i]['name']);
              }

              for (const key in data) {
                const element = data[key];
                if(key === "parent_goal_id"){
                  formData.append(key, element);
                }
                else {
                  formData.append(key.toString(), element);
                }
              }
              this.commonService.PostAPI(`goal/create`, formData).then((response: any) => {
                if (response.status) {
                  this.toastr.success(response.message, "Success");
                  this.getPlanDetails();
                  this.getPlanGoals(this.goalplanid);
                  this.childPlanFormSub.reset()
                  this.reset();
                } else {
                  this.toastr.error(response.message, "Error");
                  // this.is_disabled = false;
                }
              });
          }
        } else {
          if ($('#date-input5').val() == '') {
            this.toastr.error("Please Enter Start Date", "Error");
          } else if ($('#date-input6').val() == '') {
            this.toastr.error("Please Enter End Date", "Error");
          } else {

          }
        }
      } else {
        this.toastr.error("Please Select Project First!!", "Error");
      }
    }
  }

  launchgoalalert() {
    this.commonService.PostAPI(`delegation/get/launch/goal/alerts`, { user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.alertdata = response.data
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  

  getGoalReportByPlan(plan_id) {
    this.commonService.PostAPI(`plan/get/goal/report`, { plan_id: plan_id }).then((response: any) => {
      if (response.status) {
        this.goalReportDetails = response.data
      } else {
        this.goalReportDetails = '';
      }
    });
  }

  textDecoration(string) {
    var newString = string.replace(/_/g, " ");
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }

  uploadFile(event) {
    this.attachments = event;
  }

  deleteAttachment(index) {
    var fileKey: any = parseInt(index);
    var files: File[] = [];

    if (this.attachments && this.attachments.length > 0) {
      for (const key in this.attachments) {
        if (this.attachments.hasOwnProperty(key)) {
          if (key != fileKey) {
            const element = this.attachments[key];
            files.push(element);
          }
        }
      }
    } else {
      files = [];
    }

    this.attachments = files;
  }

  getFileExtenstion(filename) {
    return filename.split('?')[0].split('.').pop();
  }

  isImage(filename) {
    var allowExtensions = ['jpg', 'jpeg', 'png', 'gif']
    var extenstion = filename.split('?')[0].split('.').pop();

    if (allowExtensions.includes(extenstion) == true) {
      return true;
    } else {
      return false;
    }
  }

  deleteGoalAttachment(goal_attachment_id, goal_id) {
    this.commonService.PostAPI(`goal/attachments/delete`, { goal_attachment_id: goal_attachment_id }).then((response: any) => {
      if (response.status) {
        this.getGoalAttachments(goal_id)
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  getUserSharePlanPermission() {
    this.commonService.PostAPI(`plan/check/user/permission`, { user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.sharedPlanPermission = response.data.map(data => data._id);
      }
    });
  }

  checkPlanForGoalSharePermission(plan_id) {
    if (this.sharedPlanPermission.includes(plan_id) == true) {
      this.isSharedPlanPermission = true;
      this.getHierarchyUsers();
    } else {
      this.isSharedPlanPermission = false;
    }
  }

  //Get users that assigned by designations
  getHierarchyUsers() {
    this.commonService.PostAPI(`hierarchy/get/by/parent`, { parent_user_id: this.currentuser.user.parent_user_id }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.length > 0) {
          var usersArr = [];

          response.data.forEach(element => {
            var data = {
              id: element.user_id._id,
              name: `${element.user_id.first_name} ${element.user_id.last_name} - ${element.hierarchy_id.designation}`
            };

            usersArr.push(data);
          });

          this.items = usersArr;
        }
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  onChange(e) {
    this.selected = e;
  }

  selecteStage(type: any) {
    this.selectedStage = type;
    this.selectedModules = '';
    this.moduleItemActive = false;
    this.parentIsActiveSelection = true;
    this.moduleType = 'goal'
    this.planGoals = []
    this.getPlanGoals(this.parentplanDetails[0]._id)
  }

  selectPhase(type: any) {
    if (this.planId && this.planId !== '') {
      // this.selectedModules = '';
      this.selectedPhase = type;
      this.moduleItemActive = false
      if (type == 'D') {
        this.getgoal(this.planId);
        this.selectedModules = ''
      }

      if (type == 'P') {
        this.getPriorityGoals(this.planId);
        this.selectedModules = ''

      }

      if (type == 'PR') {
        this.getProposeGoals(this.planId);
        this.selectedModules = ''

      }

      if (type == 'V') {
        this.getVoteGoals(this.planId);
        this.selectedModules = ''

      }

      if (type == 'S') {
        this.getSelectGoals(this.planId);
        this.selectedModules = ''

      }

      if (type == 'DG') {
        this.getDelegateGoals(this.planId);
        this.getalldelegategoals();
        this.selectedModules = ''

      }

      if (type == 'C') {
        this.getCountdownGoals(this.planId);
        this.selectedModules = ''
      }

      if (type == 'L') {
        this.selectedModules = ''

        this.getLaunchGoals(this.planId);
      }

      if (type == 'R') {
        this.selectedModules = ''

        this.getReportGoals(this.planId);
      }

      if (type == 'M') {
        this.selectedModules = ''
        this.getPlanGoalDetails();
        this.getReportSum(this.parentplanDetails[0]._id);
        this.initMeasureCharts()
      }

      $('#date-input5').datepicker({
        dateFormat: "mm-dd-yy",
        setDate: new Date(),
        todayHighlight: true,
        startDate: '-0m',
        minDate: 0,
      });
      $('#date-input6').datepicker({
        dateFormat: "mm-dd-yy",
        setDate: new Date(),
        todayHighlight: true,
        startDate: '-0m',
        minDate: 0,
      });

      $('#date-input5').datepicker().on('changeDate', function (e) {
        $('#date-input5').datepicker('hide');
      });
      $('#date-input6').datepicker().on('changeDate', function (e) {
        $('#date-input6').datepicker('hide');
      });
    } else {
      if (this.finalarray.length) {
        this.toastr.error("Please select any plan from Project Tree in left pannel.", "Error")
      } else {
        this.toastr.error("You need to create any plan first.", "Error")
      }
    }
  }

  async getReportSum(planid){
    await this.commonService.PostAPI('report/get/all', {
      plan_id: planid,
      user_id: this.currentuser.user._id
    }).then((response: any)=>{
      if (response.status){
        var reports = response.data
        this.productionSum = reports.reduce((next, current)=>{
          return next + current.actual_production
        }, 0)
        this.expenseSum = reports.reduce((next, current)=>{
          return next + current.actual_expense
        }, 0)
      }
    })
  }

  initMeasureCharts(){

    this.commonService.PostAPI(`report/get/all`, { plan_id: this.planId, user_id: this.currentuser.user._id }).then((response: any) => {
      
      if (response.status && response.data && response.data.length > 0) {
        this.reportGoals = response.data.filter(report => {return report.element.isReportReady});
        this.actualExpenseSum = response.data.reduce((reportA, reportB)=> {
          return reportA + reportB.actual_expense
        }, 0)
        this.actualProductionSum = response.data.reduce((reportA, reportB)=> {
          console.log(reportA, reportB)
          return reportA + reportB.actual_production
        }, 0)
        // Line Chart

        if(this.chartRendered === false){
          this.prodHierarchy = response.data.sort((reportA, reportB) => {return reportA.actual_production > reportB.actual_production})
          this.expHierarchy = response.data.sort((reportA, reportB) => {return reportA.actual_expense > reportB.actual_expense})
          // Sort by dates to organize the x-axis
          this.reportGoals.sort((reportA: any, reportB: any)=> {
            return new Date(reportA.element.end_date).getDate() - new Date(reportB.element.end_date).getDate()
          })
          for(let i: any = 0; i < this.reportGoals.length; i++){
            this.datasetProd.push(this.reportGoals[i].actual_production)
            this.datasetExp.push(this.reportGoals[i].actual_expense)
            this.lineChartMainLabels.push( new Date(this.reportGoals[i].element.end_date).toDateString())
          }
          this.datasetTotal.push({
            label: "Production",
            data: this.datasetProd
          }, {
            label: "Expenses",
            data: this.datasetExp
          })
          this.chartRendered = true;
        }
      } else {
        this.reportGoals = [];
      }
    }).then(()=>this.chartIsLoaded = true)

  }
  // Deactivate
  getgoal(planid) {
    if (planid == '') {
      this.dividearrayintothreepart = 0
    } else {
      this.commonService.PostAPI(`goal/get/all/by/plan`, { id: planid, module_type: this.moduleType }).then((response: any) => {
        if (response.status && response.data && response.data.length > 0) {
          this.goals = response.data;
          this.dividearrayintothreepart = 1
          if (this.goals && this.goals.length > 10) {
            this.dividearrayintothreepart = 2;
            var totallength = Math.floor(this.goals.length / 3);
            this.high = this.goals.slice(0, totallength)
            this.medium = this.goals.slice(totallength, totallength * 2)
            this.low = this.goals.slice(totallength * 2, this.goals.length)
          }
        } else {
          this.goals = [];
        }
      });
    }
  }

  changedeactivate(id, change) {
    this.commonService.PostAPI(`goal/deactivate/changebyid`, { id: id, deactivate: change }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.getgoal(this.planId);
        this.getPlanDetails();

        this.showSelectedTree(this.selectedModules)
      } else {
        this.toastr.error(response.message, "Error");
      }
    })
  }

  // Priority
  getPriorityGoals(planid) {
    if (planid == '') {
      this.isDevidedInParts = 0
    } else {
      this.commonService.PostAPI(`goal/getgoals/bypid`, { id: planid, module_type: this.moduleType }).then((response: any) => {
        if (response.status) {
          this.priorityGoals = response.data;
          this.isDevidedInParts = 1
          if (this.priorityGoals.length > 10) {
            this.isDevidedInParts = 2;
            var totallength = Math.floor(this.priorityGoals.length / 3);
            this.highPriorityGoals = this.priorityGoals.slice(0, totallength);
            this.mediumPriorityGoals = this.priorityGoals.slice(totallength, totallength * 2);
            this.lowPriorityGoals = this.priorityGoals.slice(totallength * 2, this.priorityGoals.length);
          }
        } else {
          this.priorityGoals = [];
        }
      });
    }
  }

  updatepriority(index) {
    document.getElementById("label-priority-" + index).style.display = "none"
    document.getElementById("priority-text-" + index).style.display = "block"
  }

  updategoalpriority(goalid, index) {
    document.getElementById("label-priority-" + index).style.display = "block"
    document.getElementById("priority-text-" + index).style.display = "none"
    var changevalue: any = $("#input-priority-" + index).val();
    changevalue = parseInt(changevalue)

    if (changevalue > 0) {
      this.commonService.PostAPI('goal/update/priority', { goal_id: goalid, prioritize: changevalue }).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.getPriorityGoals(this.planId);
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    } else {
      this.toastr.error("Priority should be above 0.", "Error");
    }
  }

  changepriority(goal_id, current_priority, new_priority) {

    if (new_priority <= 1) {
      new_priority = 1;
    }

    var data = {
      goal_id: goal_id,
      current_priority: current_priority,
      new_priority: new_priority,
      plan_id: this.planId
    };

    this.commonService.PostAPI(`goal/priority/changebyid`, data).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.getPriorityGoals(this.planId);
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    })
  }

  // Propose
  getProposeGoals(planid) {
    if (planid == "") {
      this.checkboxshow = false;
      this.isProposeDevidedInParts = 0;
    } else {
      this.commonService.PostAPI(`plan/get/by/id2`, { plan_id: planid }).then((response: any) => {
        if (response.status) {
          if (response.data[0].user_id._id == this.currentuser.user._id) {
            this.commonService.PostAPI(`propose/get/goal/by/plan`, { plan_id: planid, user_id: this.currentuser.user._id, module_type: this.moduleType }).then((response: any) => {
              if (response.status) {
                this.proposeGoals = [];
                this.proposeGoals = response.data;
                this.isProposeDevidedInParts = 1;

                if (this.proposeGoals.length > 10) {
                  this.isProposeDevidedInParts = 2;

                  var totallength = Math.floor(this.proposeGoals.length / 3);
                  this.highProposeGoals = this.proposeGoals.slice(0, totallength)
                  this.mediumProposeGoals = this.proposeGoals.slice(totallength, totallength * 2)
                  this.lowProposeGoals = this.proposeGoals.slice(totallength * 2, this.proposeGoals.length)
                }
              } else {
                this.toastr.error("No Details Found", "Error");
              }
            });
          } else if (response.data[0].user_id._id != this.currentuser.user._id) {
            this.commonService.PostAPI(`propose/get/superior/goals`, { plan_id: planid, user_id: this.currentuser.user._id }).then((response: any) => {
              if (response.status) {
                this.priorityGoals = []
                response.data.forEach(element => {
                  this.priorityGoals.push(element.data.goal_id)
                });
                this.isProposeDevidedInParts = 1;

                if (this.priorityGoals.length > 10) {
                  this.isProposeDevidedInParts = 2;
                  var totallength = Math.floor(this.priorityGoals.length / 3);
                  this.highProposeGoals = this.priorityGoals.slice(0, totallength);
                  this.mediumProposeGoals = this.priorityGoals.slice(totallength, totallength * 2);
                  this.lowProposeGoals = this.priorityGoals.slice(totallength * 2, this.priorityGoals.length);
                }
              } else {
                this.toastr.error("No Details Found", "Error");
              }
            });
          }
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  changeproposal(id, change) {
    this.commonService.PostAPI(`propose/manage`, {
      goal_id: id,
      plan_id: this.planId,
      user_id: this.currentuser.user._id
    }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
      this.getProposeGoals(this.planId);
    });
  }

  handleChange($event, id) {
    if ($event.target.checked === true) {
      var changepropose = 1;
    } else {
      var changepropose = 0;
    }

    this.commonService
      .PostAPI(`goal/proposal/changebyid`, { id: id, propose: changepropose })
      .then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.getProposeGoals(this.planId);
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
  }

  // Vote
  getVoteGoals(planid) {
    this.commonService.PostAPI(`goal/getgoals/byvote`, { id: planid, module_type: this.moduleType }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.voteGoals = response.data;
      } else {
        this.voteGoals = [];
      }
    });
  }

  reloadDatatable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  checkvote(goal) {
    if (goal.voteup.includes(this.currentuser.user._id) == true || goal.votedown.includes(this.currentuser.user._id) == true) {
      return true;
    } else {
      return false;
    }
  }

  dataTableAfterViewInit() {
    var table = $('#' + this.tableId).DataTable({destroy: true});
    table.destroy();

    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.columns().every(function () {
    //     const that = this;
    //   });
    // });
  }

  resetSearch() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getVoteGoals(this.planId);
  }

  changevote(id, change) {
    this.commonService
      .PostAPI(`goal/voteupdown/byid`, {
        id: id,
        userid: this.currentuser.user._id,
        vote: change
      })
      .then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.resetSearch();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
  }

  // Select
  getSelectGoals(planId) {
    this.commonService.PostAPI(`goal/getgoals/byvote`, { id: planId, module_type: this.moduleType }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.selectGoals = response.data;
      } else {
        this.selectGoals = [];
      }

      // $("#table-select").dataTable().fnDestroy();
      // $("#table-select").dataTable();
      // // this.dataTableAfterViewInit();
    });
  }

  updateplanselect(e, goal_id) {
    var status: number;

    if (e.target.checked) {
      status = 1;
    } else {
      status = 0;
    }
    this.commonService.PostAPI(`goal/update/select`, {
      select: status,
      id: goal_id,
      security: this.plansecurity
    }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  // Delegate
  getDelegateGoals(planid) {
    this.commonService.PostAPI(`goal/getgoals/bydelegate`, { id: planid, module_type: this.moduleType }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.delegateGoals = response.data;
      } else {
        this.delegateGoals = [];
      }

      this.dtTriggerDelegate.next();
      this.dataTableAfterViewInit();
    });
  }

  get df() { return this.DelegateForm.controls; }

  getallchild() {
    //Get All Child Users
    if (this.currentchildUser == null) {
      this.currentchildUser = []
    }

    this.commonService.PostAPI(`plan/get/allchilduser`, { childids: this.currentchildUser }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.childuser = response.data;
      } else {
        this.childuser = [];
      }
    });
  }

  goaldelegate(id, name) {
    this.goalname = name
    this.delegateGoalId = id
    this.isDelegateFormSubmitted = false;

    $("#myModal").modal("show");

    this.commonService.PostAPI(`delegation/get/goals`, { goal_id: this.delegateGoalId }).then((response: any) => {
      if (response.status) {
        this.goalDelegateData = response.data;
        this.totalgoalacceptpercentage = 0
        this.totalgoalpendingpercentage = 0
        this.totalgoalrejectpercentage = 0
        this.totalgoalpercentage = 0

        this.goalDelegateData.forEach(element => {
          if (element.is_accept == 1) {
            this.totalgoalacceptpercentage = this.totalgoalacceptpercentage + element.percentage;
          } else if (element.is_accept == 0) {
            this.totalgoalpendingpercentage = this.totalgoalpendingpercentage + element.percentage;
          } else if (element.is_accept == 2) {
            this.totalgoalrejectpercentage = this.totalgoalrejectpercentage + element.percentage;
          }
        });

        this.totalgoalpercentage = 100 - (Number(this.totalgoalacceptpercentage) + Number(this.totalgoalpendingpercentage));

        if (this.totalgoalpercentage == 100) {
          this.showdelegatform = true
        } else {
          this.showdelegatform = false
        }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  //Save Delegate Goal Modal
  SaveDelegate() {
    this.isDelegateFormSubmitted = true;
    if (this.DelegateForm.invalid) {
      return;
    } else {
      if (Number(this.df.percentage.value) <= Number(this.totalgoalpercentage)) {
        var data = this.DelegateForm.value;

        data.user_id = this.currentuser.user._id;
        data.goal_id = this.delegateGoalId;
        data.plan_id = this.planId;
        data.start_date = new Date().getTime();
        data.end_date = new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).getTime();
        data.parent_user_id = this.currentuser.user.parent_user_id;

        this.commonService.PostAPI(`delegation/create`, data).then((response: any) => {
          if (response.status) {
            this.toastr.success(response.message, "Success");
            this.DelegateForm.reset();
            $("#myModal").modal("hide");
          } else {
            this.toastr.error(response.message, "Error");
          }
        });
      } else {
        this.toastr.error("Enetered percentage extends from total percentage.", "Error");
      }
    }
  }

  getalldelegategoals() {
    this.commonService.PostAPI(`delegation/get/user/goals`, { child_user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.delegatedGoals = response.data;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  changegoaldelegatestatus(id, status) {
    this.commonService.PostAPI(`delegation/accept/status`, { delegation_id: id, accept_status: status }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        this.getalldelegategoals();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  //Countdown
  getCountdownGoals(planid) {
    this.commonService.PostAPI(`goal/getgoals/bycountdown`, { id: planid, module_type: this.moduleType }).then((response: any) => {
      if (response.status) {
        this.countdownGoals = response.data;
        this.countdownGoals.forEach((element1, index) => {
          var finalhours = 0;
          var finalminutes = 0;
          if (element1.countdown) {
            if (new Date(this.countdownGoals[0].start_date).getTime() >= new Date().getTime()) {
              var end_time = new Date().getTime();
            }
            if (new Date(this.countdownGoals[0].start_date).getTime() == new Date().getTime()) {
              var end_time = new Date(this.countdownGoals[0].start_date).getTime();
            }
            if (new Date(this.countdownGoals[0].start_date).getTime() <= new Date().getTime()) {
              var end_time = new Date(this.countdownGoals[0].start_date).getTime();
            }
            var diff = new Date(element1.end_date).getTime() - new Date().getTime();
            var days = Math.floor(diff / (60 * 60 * 24 * 1000));
            var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
            var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
            var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
            finalhours += hours;
            finalminutes += minutes;
            if (finalminutes > 60) {
              finalhours++;
              finalminutes = finalminutes - 60;
            }
            this.countdownGoals[index]['total_time'] = days + 'D:' + finalhours + 'H:' + finalminutes + 'M';
          }
        })

        this.dividearrayintothreepart = 1
        if(!this.initGrabCD) {
          this.dtTriggerCountdown.next();
          this.dataTableAfterViewInit();
        }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  // Launch
  getLaunchGoals(planid) {
    this.commonService.PostAPI(`goal/getgoals/bycountdown`, { id: planid, module_type: this.moduleType }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.launchGoals = response.data;
        this.launchGoals.forEach((element1, index) => {
          var finalhours = 0;
          var finalminutes = 0;
          if (element1.countdown) {
            var diff = new Date().getTime() - new Date(element1.start_date).getTime();
            var days = Math.floor(diff / (60 * 60 * 24 * 1000));
            var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
            var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
            finalhours += hours;
            finalminutes += minutes;
            if (finalminutes > 60) {
              finalhours++;
              finalminutes = finalminutes - 60;
            }
            let TimesArr = [days, finalhours, finalminutes]
            let verifiedTimesArr = TimesArr.map((time)=>{
              if(time<0){
                return 'XX'
              }
              else return time
            })

            if (verifiedTimesArr.includes('XX')){
              this.launchGoals[index]['total_time'] = 'Ahead of start date, check back later!';
            }
            else { 
              this.launchGoals[index]['total_time'] = verifiedTimesArr[0] + 'D:' + verifiedTimesArr[1] + 'H:' + verifiedTimesArr[2] + 'M';
            }
          }
        });
      } else {
        this.launchGoals = [];
      }

      // this.dtTriggerLaunch.next();
      this.tableId = 'table-launch';
      this.dataTableAfterViewInit();
    });
  }

  convertStringToInt(str){
    return Number(str);
}

  // Report
  getReportGoals(planid) {
    this.commonService.PostAPI(`report/get/all`, { plan_id: planid, user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.reportGoals = response.data.filter(report => report.element.isReportReady);
      } else {
        this.reportGoals = [];
      }
      this.dtTriggerReport.next();

      this.tableId = 'report-table';
      this.dataTableAfterViewInit();
    });
  }

  warnConstruction(){
    alert('Under construction, please check back later for updates!')
  }

  showreportform(goalid, reportid, data) {
    this.reportGoalId = goalid
    this.reportId = reportid
    if (this.reportId == '') {
      this.ReportForm.reset();
      this.submitted = false;
    }
    $("#reportModal").modal("show");
    this.ReportForm.setValue({
      actual_production: data.actual_production,
      actual_expense: data.actual_expense,
    });
  }

  get rf() { return this.ReportForm.controls; }

  SaveReport() {
    this.isReportFormSubmitted = true;
    if (this.ReportForm.invalid) {
      return;
    } else {
      var data = this.ReportForm.value
      data.report_id = this.reportId
      data.plan_id = this.planId
      data.goal_id = this.reportGoalId
      data.user_id = this.currentuser.user._id

      this.commonService.PostAPI(`report/create`, data).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");

          this.isReportFormSubmitted = false;
          this.ReportForm.reset();
          
          $("#reportModal").modal("hide");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });

      this.tableId = 'report-table'
      $(`#${this.tableId}`).DataTable().clear()
      this.getReportGoals(this.planId)
    }
  }

  resetReportSearch() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getReportGoals(this.planId);
  }

  // Measure
  getPlanGoalDetails() {
    var from_date = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    var to_date = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;

    var fromDateTimestamp = new Date(from_date).getTime();
    var toDateTimestamp = new Date(to_date).getTime();

    if (toDateTimestamp < fromDateTimestamp) {
      this.toastr.error("To date should be smaller than From date.", "Filter Validation Error");
    } else {
      this.commonService.PostAPI(`plan/get/by/user`, {
        user_id: this.currentuser.user._id,
        fromDate: moment(from_date).format('YYYY-MM-DD'),
        toDate: moment(to_date).format('YYYY-MM-DD')
      }).then((response: any) => {
        if (response.status) {
          if (response.data && response.data.length > 0) {
            this.isDetailsFound = true;
            this.planDetails = response.data;

            var total_expected_target = this.planDetails.map(data => data.goal.total_expected_target);
            var expected_target = total_expected_target.reduce((a, b) => a + b, 0);
            expected_target = (expected_target) ? expected_target : 0;

            var actual_expected_target = this.planDetails.map(data => data.goal.actual_expected_target);
            var actual_expected = actual_expected_target.reduce((a, b) => a + b, 0);
            actual_expected = (actual_expected) ? actual_expected : 0;

            var needExpectedPercentage = (actual_expected * 100) / expected_target;

            this.bottomLabel = actual_expected;
            this.needleValue = needExpectedPercentage;

            this.options = {
              hasNeedle: true,
              needleColor: '#F0F4F2',
              needleUpdateSpeed: 1000,
              arcColors: ['#FF4A4E', '#7BFF75'],
              arcDelimiters: [30],
              rangeLabel: ['0', `${expected_target}`],
              needleStartValue: actual_expected,
            }

            var total_revenue_target = this.planDetails.map(data => data.goal.total_revenue_target);
            var revenue_target = total_revenue_target.reduce((a, b) => a + b, 0);
            revenue_target = (revenue_target) ? revenue_target : 0;

            var actual_revenue_target = this.planDetails.map(data => data.goal.actual_revenue_target);
            var actual_revenue = actual_revenue_target.reduce((a, b) => a + b, 0);
            actual_revenue = (actual_revenue) ? actual_revenue.toFixed(0) : 0;

            var needRevenuePercentage = (actual_revenue * 100) / revenue_target;

            this.review_bottomLabel = actual_revenue;
            this.review_needleValue = needRevenuePercentage;

            this.review_options = {
              hasNeedle: true,
              needleColor: '#F0F4F2',
              needleUpdateSpeed: 1000,
              arcColors: ['#FF4A4E', '#7BFF75'],
              arcDelimiters: [30],
              rangeLabel: ['0', `${actual_revenue}`],
              needleStartValue: actual_revenue,
            }
          } else {
            this.isDetailsFound = false;
          }
        } else {
          this.isDetailsFound = false;
        }
      });
    }
  }

  onChangeDate() {
    this.getPlanGoalDetails();
  }

  // Start Modules Functionality
  selectModule(type: any) {
    if (this.selectedPhase !== 'B') {
      return this.toastr.error("Must be under brainstorm phase to use modules.")
    }
    else {
      this.moduleItemActive = false;
      this.isSelectedChallange = false;
      this.ModuleForm.reset()
      this.ModuleFormSub.reset()
      if (this.planId || this.goalid) {
        this.selectedModules = type;
        this.moduleType = type;
        this.showSelectedTree(type)
        this.getModules();
        this.ref.detectChanges();
  
        $('#module-start-date').datepicker({
          dateFormat: "mm-dd-yy",
          setDate: new Date(),
          todayHighlight: true,
          startDate: new Date(this.parentplanDetails[0].start_date),
          endDate: new Date(this.parentplanDetails[0].end_date),
          minDate: new Date(this.parentplanDetails[0].start_date),
          maxDate: new Date(this.parentplanDetails[0].end_date)
        });
        $('#module-end-date').datepicker({
          setDate: new Date(),
          todayHighlight: true,
          startDate: new Date(this.parentplanDetails[0].start_date),
          endDate: new Date(this.parentplanDetails[0].end_date),
          minDate: new Date(this.parentplanDetails[0].start_date),
          maxDate: new Date(this.parentplanDetails[0].end_date)
        });
  
        $('#module-start-date').datepicker().on('changeDate', function (e) {
          $('#module-start-date').datepicker('hide');
        });
  
        $('#module-end-date').datepicker().on('changeDate', function (e) {
          $('#module-end-date').datepicker('hide');
        });
  
        this.selectPhase(this.selectedPhase);
        this.getPlanGoals(this.planId);
      } else {
        this.toastr.error("Something went wrong...", "Error")
      }
    }
  }

  selectChallangeModule() {
    this.isSelectedChallange = true;
  }

  // Modules
  get mf() { return this.ModuleForm.controls; }

  resetModule() {
    this.isModuleFormSubmitted = false;
    this.ModuleForm.reset();
  }

  saveModule() {
    this.isModuleFormSubmitted = true;
    if (this.ModuleForm.invalid) {
      return;
    } else {
      var startDate: any = $("#module-start-date").val();
      var endDate: any = $("#module-end-date").val();

      if (startDate != '' && endDate != '') {
        if (new Date(startDate) > new Date(endDate)) {
          this.toastr.error("Start date must be smaller than end date.", "Error");
        } else {
          if (new Date(this.planstartdate) <= new Date(startDate) && new Date(this.planenddate) > new Date(startDate) && new Date(this.planstartdate) < new Date(endDate) && new Date(this.planenddate) >= new Date(endDate)) {
            var data = this.ModuleForm.value;
            data.plan_id = this.parentIsActiveSelection ? this.planId : this.goalid;
            data.user_id = this.currentuser.user._id
            data.status = 0;
            data.numbers = 0;
            data.start_date = startDate;
            data.end_date = endDate;
            data.module_type = this.selectedModules;

            const formData: any = new FormData();
            const files: Array<File> = this.moduleAttachments;

            for (let i = 0; i < files.length; i++) {
              formData.append("attachments", files[i], files[i]['name']);
            }

            for (const key in data) {
              const element = data[key];
              formData.append(key.toString(), element);
            }

            this.commonService.PostAPI(`goal/create`, formData).then((response: any) => {
              if (response.status) {
                this.toastr.success(response.message, "Success");
                this.getPlanDetails();

                this.showSelectedTree(this.selectedModules);

                this.isModuleFormSubmitted = false;
                this.ModuleForm.reset();
              } else {
                this.toastr.error(response.message, "Error");
              }
            });
          } else {
            this.toastr.error(this.textDecoration(this.selectedModules) + " start date and end date are extended from plan.", "Error");
          }
        }
      } else {
        if (startDate == '') {
          this.toastr.error("Please Enter Start Date", "Error");
        } else if (endDate == '') {
          this.toastr.error("Please Enter End Date", "Error");
        }
      }
    }
  }

  getSelectedModule(id){
    this.commonService.PostAPI('module/find-selected', {_id: id}).then((res: any)=>{
      if (res.status) {
        this.currentModuleDetails = res.data[0]
        return ;
      }
      else {
        return this.toastr.error(res.message, "Error: Failed to retrieve created module, please try again later. If this problem persists, please file a bug report as soon as possible with the bug reporting tool.")
      }
    })
  }

  saveModuleSub(){
    this.isModuleFormSubmitted = true;
    if (this.ModuleFormSub.invalid) {
      return;
    } 
    else {
            var data = this.ModuleFormSub.value;
            data.parent_goal_id = this.currentModuleDetails._id
            data.plan_id = this.planId;
            data.user_id = this.currentuser.user._id
            data.status = 0;
            data.numbers = 0;
            data.module_type = this.selectedModules;

            const formData: any = new FormData();
            const files: Array<File> = this.moduleAttachments;

            for (let i = 0; i < files.length; i++) {
              formData.append("attachments", files[i], files[i]['name']);
            }

            for (const key in data) {
              const element = data[key];
              formData.append(key.toString(), element);
            }

            this.commonService.PostAPI(`goal/create`, formData).then((response: any) => {
              if (response.status) {
                this.toastr.success(response.message, "Success");
                this.getPlanDetails();
                this.showSelectedTree(this.selectedModules);

                this.isModuleFormSubmitted = false;
              } else {
                this.toastr.error(response.message, "Error");
              }
            })
            this.ModuleFormSub.reset()
            
        }
    }


  getModuleTreeDetails(type) {
    var data: any = {};
    var a = this;
    data.plan_id = this.parentIsActiveSelection ? this.planId : this.goalid;
    data.user_id = this.currentuser.user._id
    data.module_type = type;
    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      var treeArray: any = [];
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        response.data.filter((element)=>{
          if(this.parentIsActiveSelection){
            return element.plan_id === this.planId
          }
          else {
            return element.plan_id === this.goalid.toString();
          }
        }).forEach(element => {
            if (element.parent_goal_id !== ''){
              treeArray.push({ "id": element._id, "parent": element.parent_goal_id, "text": element.short_name, 'state': { 'opened': false }, "icon": "assets/images/avatars/M.png" });
            }
            else {
            treeArray.push({ "id": element._id, "parent": "#", "text": element.short_name, 'state': { 'opened': false }, "icon": "assets/images/avatars/M.png" });
            }
        });
      }
      $('#jstree-module-tree').jstree("destroy");
      $("#jstree-module-tree").on("select_node.jstree",
        function (evt, data) {
          a.editChildEnabled = false
          a.getgoaldetail(data.selected[0], data.node.parent);
          a.getSelectedModule(data.selected[0])
          a.getGoalReportByPlan(data.node.parent);
          a.parentIsActiveSelection = false;
          a.getGoalAttachments(data.selected[0]);
          a.getGoalSharedUsers(data.selected[0]);
          a.checkPlanForGoalSharePermission(data.plan_id);
         }
      );
      $('#jstree-module-tree').jstree({ core: { data: treeArray } });
    });
  }

  getModules() {
    var data: any = {};

    data.plan_id = this.planId;
    data.user_id = this.currentuser.user._id
    data.module_type = this.selectedModules;

    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        this.moduleGoals = response.data;
      } else {
        this.moduleGoals = [];
      }

      // this.dtTriggerModule.next();
      if(this.selectedModules === 'process'){
        this.tableId = 'table-module-p'
      }
      if(this.selectedModules === 'motive'){
        this.tableId = 'table-module-m'
      }
      if(this.selectedModules === 'analysis'){
        this.tableId = 'table-module-a'
      }
      if(this.selectedModules === 'intelligence'){
        this.tableId = 'table-module-i'
      }
      if(this.selectedModules === 'strategy'){
        this.tableId = 'table-module';
      }
      this.dataTableAfterViewInit();
    });
  }

  uploadAttachment(event) {
    this.moduleAttachments = event;
  }

  selectPanel(type: any) {
    // this.selectedModules = '';
    this.selectedPhase = type;
    if (type == 'team') {
      this.getChildDesignations(this.hierarchyDetails._id);
    }

    if (type == 'project') {
      var datePipe = new DatePipe("en-US");
      $('#date-input5').datepicker('setDate', datePipe.transform(this.planDetails.start_date, 'MM/dd/yyyy'));
      $('#date-input6').datepicker('setDate', datePipe.transform(this.planDetails.end_date, 'MM/dd/yyyy'));
      this.getplanform();
      // this.parentplangroup.get('security').setValue('0');
    }

    setInterval(() => {
      $('#date-input5').datepicker().on('changeDate', function (e) {
        $('#date-input5').datepicker('hide');
      });

      $('#date-input6').datepicker().on('changeDate', function (e) {
        $('#date-input6').datepicker('hide');
      });
    }, 500)

    if (type == 'coaches-corner') {
      return ;
    }
  }

  getUserRole() {
    this.commonService.PostAPI(`hierarchy/get/user/designation`, { user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status && response.data) {
        this.hierarchyDetails = response.data.hierarchy_id;
      }
    });
  }

  getChildDesignations(hiearachyId) {
    this.commonService.PostAPI(`hierarchy/get/user/all/childs`, { hierarchy_id: hiearachyId }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.userHierarchyData = response.data;
      } else {
        this.userHierarchyData = [];
      }
    });
  }

  resetInviteForm() {
    this.isInviteUserFormValid = false;
    this.InviteUserForm.reset();
  }

  submitInviteForm() {
    this.isInviteUserFormValid = true;
    if (this.InviteUserForm.invalid) {
      return;
    } else {
      var data = this.InviteUserForm.value;
      data.parent_user_id = this.currentuser.user.parent_user_id;
      data.role_id = this.currentuser.user.role_id;
      data.current_url = this.currentUrl;

      this.commonService.PostAPI(`users/desigation/create`, data).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.resetInviteForm();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  get iFrm() {
    return this.InviteUserForm.controls;
  }

  getChildUsers() {
    this.commonService.PostAPI(`users/get/designations`, { user_ids: this.currentchildUser }).then((response: any) => {
      var usersArr = [];

      if (response.data && response.data.length > 0) {
        response.data.forEach(element => {
          var data = {
            id: element.user_id._id,
            name: `${element.user_id.first_name} ${element.user_id.last_name} - ${element.hierarchy_id.designation}`,
            hierarchy_id: element.hierarchy_id._id
          };

          usersArr.push(data);
        });
      }
      this.childUsersList = usersArr;
    });
  }

  onChangeUser(e) {
    this.selectedUser = e;
  }


  getplanform() {
    /**
     * Plan form detail from admin
     */

    this.commonService.PostAPI(`plan/getform/by/id`, { userid: this.userid }).then((response: any) => {
      if (response.status) {
        this.final = response.data.palnformfield;
        this.datafinal = response.data.palnformfield;
        this.formfield = response.data.palnformfield;
        if (response.data.palnformfield.length == 0) {
          this.formfield = [{ name: '', type: '', required: '', label: '', value: '', userid: this.userid }]
        } else {
          this.final.forEach(element => {
            if (element.required == "true") {
              this.data[0][element.name] = ['', Validators.required];
            } else {
              this.data[0][element.name] = [''];
            }
          });
          this.parentplangroup = this.formBuilder.group(this.data[0]);
          if (this.editid != undefined) {
            var datePipe = new DatePipe("en-US");
            this.final.forEach(element => {
              Object.keys(element).forEach(key => {
                if (this.planDetails[element.name] == undefined) {
                  this.planDetails[element.name] = ''
                }
                this.parentplangroup.patchValue({
                  [element.name]: this.planDetails[element.name]
                })
              })
            })
            this.parentplangroup.patchValue({
              numbers: this.planDetails.numbers,
              short_name: this.planDetails.short_name,
              long_name: this.planDetails.long_name,
              description: this.planDetails.description,
              start_date: datePipe.transform(this.planDetails.start_date, 'MM/dd/yyyy'),
              end_date: datePipe.transform(this.planDetails.end_date, 'MM/dd/yyyy'),
              security: this.planDetails.security,
              share_users: this.selected,
            });
          }
        }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  addcontrol(i) {

    /**
     * Add form control for (+ button)add new field in plan form
     */
    var test = $("#data" + i).val();
    this.data[0][test] = [''];
    this.parentplangroup = this.formBuilder.group(this.data[0]);

  }

  get jval() {
    return this.parentplangroup.controls;
  }
  fetch() {
    this.datafinal = this.final;
    $("#fromControlModal").modal("show");

  }
  removeoption(i) {
    var index = $("#controlid").val();
    this.formfield[index]['option'] = this.selectoption;
    //$("#myModal2").modal("hide");
    delete this.formfield[index]['option'][i]

    this.formfield[index]['option'].splice(i, 1)
  }
  onAddData() {
    /**
   * add new control in plan form
   */
    this.formfield.push({ name: '', type: '', required: '', label: '', value: '', userid: this.userid })
  }
  onAddoption() {
    this.selectoption.push({ id: '' })
  }

  onplanformcreate() {
    /**
    * form control plan form save into database
    */
    this.final = this.formfield
    this.datafinal = this.final
    var i = 0;
    var j = 0;
    var k = 0;
    var valid = []
    var selectbox = []

    if (this.formfield && this.formfield.length > 0) {
      this.formfield.forEach(element => {

        if (element.name == '' || element.type == '' || element.required == '') {
          i++;
        }
        if (valid.includes(element.name)) {
          j++;
        } else {
          valid.push(element.name);
        }
        if (element.type == "select") {
          if (element['option'].length == 0) {
            k++;
            selectbox.push(element.name)
          }
        } else {
          valid.push(element.name);
        }
        if (element.required == "true") {
          this.data[0][element.name] = ['', Validators.required];
        } else {
          this.data[0][element.name] = [''];
        }
      });

      this.parentplangroup = this.formBuilder.group(this.data[0]);

      if (i == 0) {
        if (j == 0) {
          if (k == 0) {
            this.commonService.PostAPI(`plan/create/form`, this.formfield).then((response: any) => {
              if (response.status) {
                this.toastr.success(response.message, "Success");
                $("#fromControlModal").modal("hide");
              } else {
                this.toastr.error(response.message, "Error");
              }
            });
          } else {
            this.toastr.error("Add an option for '" + selectbox.toString() + "' Form control ", "Error");
          }
        } else {
          this.toastr.error("Form control name are same like", "Error");
        }
      } else {
        this.toastr.error("Please enter all fields", "Error");
      }
    }
  }

  // remove form control plan form 
  removeData(i) {
    /*
    * remove key of element from formfield array
    * modified at: 19-03-2020 12:42 PM
    * author: Hardik Gadhiya
    */
    this.formfield.splice(i, 1);

    var data = {
      user_id: this.currentuser.user._id,
      field_name: this.currentuser.user.palnformfield[i].name
    }
    this.commonService.PostAPI('users/remove-field', data)
  }

  visitParentForm(plan_id){
    this.getPlanDetails()
    this.getplandetail(plan_id);
    this.getGoalReportByPlan(plan_id);
    plan_id = plan_id;
    this.parentIsActiveSelection = true;
    $('#jstree').jstree(true).redraw()
  }

  getselectoption(option, i) {
    if (option == "select") {
      this.showcustomtag = true;
      this.formfield[i]["option"] = [];
    } else {
      var key = "option";
      delete this.formfield[i][key]
    }
  }

  addoption(i) {
    this.selectoption = this.formfield[i]['option'];
    $("#myModal2").modal("show");
    $("#controlid").val(i)
  }

  saveoption() {
    var index = $("#controlid").val();
    this.formfield[index]['option'] = this.selectoption;
    $("#myModal2").modal("hide");
  }
  /**
    * plan form save
  **/
  submitPlanForm() {
    this.parentplangroup.get('start_date').setValue($('#date-input5').val())
    this.parentplangroup.get('end_date').setValue($('#date-input6').val())
    this.IsLoginFormValid = true;
    if (this.parentplangroup.invalid) {
      return;
    } else {
      if ($('#date-input5').val() != '' && $('#date-input6').val() != '') {
        if (new Date($('#date-input5').val()) > new Date($('#date-input6').val())) {
          this.toastr.error("Your start date is greater than End Date", "Error");
        } else {
          var data = this.parentplangroup.value;
          data.id = this.editid;
          data.user_id = this.currentuser.user._id;
          data.numbers = 1;
          data.status = 0;
          data.plan_id = 1;
          data.add = this.final;
          data.start_date = $('#date-input5').val();
          data.end_date = $('#date-input6').val();  
          if (this.selectedSharedPlanUser && this.selectedSharedPlanUser.length > 0) {
            data.shared_permission_users = this.selectedSharedPlanUser.map(data => data.id);
          } else {
            data.shared_permission_users = [];
          }

          this.commonService.PostAPI(`plan/create/parent`, data).then((response: any) => {
            if (response.status) {
              this.toastr.success(response.message, "Success");

              this.IsLoginFormValid = false;
              this.parentplangroup.reset();

              this.getPlanDetails();

              this.selectedPhase = 'project';
            } else {
              this.toastr.error(response.message, "Error");
            }
          });
        }
      } else {
        if ($('#date-input5').val() == '') {
          this.toastr.error("Please Enter Start Date", "Error");
        } else if ($('#date-input6').val() == '') {
          this.toastr.error("Please Enter End Date", "Error");
        }
      }
    }
  }

  resetPlanForm() {
    this.IsLoginFormValid = false;
    this.parentplangroup.reset();
    this.parentplangroup.get('security').setValue('0');
    this.parentplangroup.get('production_type').setValue('');
  }

  onChangePlan(e) {
    this.selectedSharedPlanUser = e;
  }

  getCoachesCornerDetails() {
    this.commonService.PostAPI(`coach/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.coachesDetails = response.data;
      } else {
        this.coachesDetails = [];
      }

      // this.dtOptionsCoaches = {
      //   columnDefs: [
      //     { orderable: false, targets: [1] }
      //   ],
      //   pagingType: 'full_numbers',
      //   pageLength: 10,
      // };
      // this.dtTriggerCoaches.next();
      // this.dataTableAfterViewInit();
    });
  }

  getDesignations() {
    this.commonService.PostAPI(`hierarchy/get/by/parent`, { parent_user_id: this.currentuser.user.parent_user_id }).then((response: any) => {
      if (response.status) {
        this.users = response.data.filter(item => item.user_id.email !== this.currentuser.user.email);
      } else {
        this.users = [];
      }
    });
  }

  // Discussion
  get dscf() {
    return this.DiscussionForm.controls;

  }

  resetDiscussionForm() {
    this.isSubmittedDiscussionForm = false;
    this.DiscussionForm.reset();
  }

  onSubmitDiscussion() {
    this.isSubmittedDiscussionForm = true;

    if (this.DiscussionForm.invalid) {
      return;
    } else {
      if (this.planId && this.planId !== '') {
        var data = this.DiscussionForm.value;
        data.user_id = this.currentuser.user._id;
        data.plan_id = this.planId;

        var formData: any = new FormData();
        const files: Array<File> = this.discussionAttachments;

        for (let i = 0; i < files.length; i++) {
          formData.append("attachment", files[i], files[i]['name']);
        }

        for (const key in data) {
          const element = data[key];
          formData.append(key.toString(), element);
        }

        this.commonService.PostAPI(`module/disucssion/create`, formData).then((response: any) => {
          if (response.status) {
            this.toastr.success(response.message, "Success");
            this.resetDiscussionForm();
          } else {
            this.toastr.error(response.message, "Error");
          }
        });
      } else {
        this.toastr.error("Please select any plan.", "Error");
      }
    }
  }

  uploadDiscussionAttachment(event) {
    this.discussionAttachments = event;
  }

  showSelectedTree(type) {
    this.getModuleTreeDetails(type);
  }

}

@Pipe({ name: 'itemplanitemdate' })

export class itemplanitemdate implements PipeTransform {
  transform(value: string) {
    var datePipe = new DatePipe("en-US");
    value = datePipe.transform(value, 'MM/dd/yyyy');

    return value;
  }
}
