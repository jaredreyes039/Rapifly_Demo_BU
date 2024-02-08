import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { get } from 'jquery';

declare var $: any;

@Component({
  selector: 'app-item-plan-detalis',
  templateUrl: './item-plan-detalis.component.html',
  styleUrls: ['./item-plan-detalis.component.css']
})
export class ItemPlanDetailsComponent implements OnInit {


  // TRIGGER DISPLAY'S
  itemSelected: boolean = false;
  challengeSelected: boolean = false;
  moduleSelected: boolean = false;
  challengeItemSelected: boolean = false;
  challengeView: String = 'problem'
  moduleView: String = 'strategy'
  challengeModuleView: String = 'strategy'

  // VARS
  childPlanForm: FormGroup;
  submitted: boolean = false;

  // DISCUSSION VARS
  DiscussionForm: FormGroup;
  isSubmittedDiscussionForm: boolean = false;
  discussionAttachments: any = [];

  // MODULE VARS
  moduleItemActive: Boolean = false;
  currentModuleDetails: any;
  childGoalId;
  goalplanid;
  editingStatus = false
  parentIsActiveSelection: boolean;

  // USER VARS
  currentchildUser
  currentuser;
  currentparentUser

  // PLAN VARS
  planId;
  planstartdate;
  planenddate;
  goalPlanName;
  goalReportDetails: any = '';
  planHudDetails: any;
  planDetails: any = [];
  startDate: any = '';
  endDate: any = '';

  // projectTreePlanItems needs correction
  projectTreePlanItems: any = [];
  selectedParentPlanDetails: any = [];
  selectedChildGoalDetails: any = [];
  childParentId: String = ""

  // FEEDBACK
  feedbackModalOpen: boolean = false;
  keepGetStartedOpenOnVist: boolean;
  FeedbackForm: FormGroup;

  // ATTACH VARS
  files: any = [];
  attachments: File[] = [];
  goalAttachments: any = [];

  // PERMISSION VARS
  sharedPlanPermission: any = [];
  isSharedPlanPermission: boolean = false;

  // SELECTION VARS
  items = [];
  selected = [];
  selectedPhase: any = 'B';
  selectedStage: any = 'create';
  selectedChallenge: String = 'problem';

  // DEACTIVATE VARS
  goals: any = [];
  high: any = [];
  low: any = [];
  medium: any = [];
  dividearrayintothreepart: any = 0;

  // PRIORITY VARS
  isDevidedInParts: any = 0;
  priorityGoals: any = []
  highPriorityGoals: any = []
  lowPriorityGoals: any = []
  mediumPriorityGoals: any = []

  // PROPOSE VARS
  isProposeDevidedInParts: number = 0;
  checkboxshow: boolean = false;
  proposeGoals: any = []
  highProposeGoals: any = []
  lowProposeGoals: any = []
  mediumProposeGoals: any = []


  // EDIT VARS
  editChildEnabled: boolean = false;

  // DATATABLE VARS
  @ViewChild(DataTableDirective, { static: false })
  @ViewChild(BaseChartDirective, {static: false}) chart:BaseChartDirective;
  datatableElement: DataTableDirective;
  dtOptionsDelegate: DataTables.Settings = {};
  dtTriggerDelegate: Subject<any> = new Subject();
  dtOptionsVote: DataTables.Settings = {};
  dtTriggerVote: Subject<any> = new Subject();
  dtOptionsSelect: DataTables.Settings = {};
  dtTriggerSelect: Subject<any> = new Subject();
  dtOptionsCountdown: DataTables.Settings = {};
  dtTriggerCountdown: Subject<any> = new Subject();
  dtOptionsLaunch: DataTables.Settings = {};
  dtTriggerLaunch: Subject<any> = new Subject();
  dtOptionsReport: DataTables.Settings = {};
  dtTriggerReport: Subject<any> = new Subject();
  dtOptionsPlanGoals: DataTables.Settings = {};
  dtTriggerPlanGoals: Subject<any> = new Subject();
  dtOptionsModule: DataTables.Settings = {};
  dtTriggerModule: Subject<any> = new Subject();
  dtOptionsCoaches: DataTables.Settings = {};
  dtTriggerCoaches: Subject<any> = new Subject();
  tableId: any;

  // VOTE VARS
  voteGoals: any = [];

  // SELECT VARS
  selectGoals: any = [];
  plansecurity: any;

  // DELEGATE VARS
  delegateGoals: any = [];
  DelegateForm: FormGroup;
  isDelegateFormSubmitted: boolean = false;
  goalname: any;
  delegateGoalId: any;
  goalDelegateData: any = [];
  totalgoalacceptpercentage: number = 0;
  totalgoalrejectpercentage: number = 0;
  totalgoalpendingpercentage: number = 0;
  totalgoalpercentage: number = 0;
  showdelegatform: boolean = false;
  delegatedGoals: any = [];

  // COUNTDOWN VARS
  countdownGoals: any = [];

  // LAUNCH VARS
  launchGoals: any = [];

  // REPORT
  reportGoals: any = [];
  reportGoalId: any;
  reportId: any;
  reportDetail: any;
  // ALL GOALS BY PLAN
  planGoals: any = [];
  ReportForm: FormGroup;
  isReportFormSubmitted: boolean = false;

  // MEASURE VARS
  hoveredDate: NgbDate;
  isDetailsFound: boolean = false;
  fromDate;
  toDate;
  actualExpenseSum: Number;
  actualProductionSum: Number;
  prodHierarchy: any = [];
  expHierarchy: any = [];
  chartRendered: Boolean = false;
  plansArrayForTree = [];
  productionSum: Number
  expenseSum: Number
  datasetProd: any = []
  datasetExp: any = []
  datasetTotal: any = []
  expectedRunway: any;
  actualRunway: any;
  netBurnRate: any;
  grossBurnRate: any;
  avgProdSum: any;
  avgProd: any;

  // LINE CHART CONFIG
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

  // CANVAS CONFIG FOR CHART
  public canvasWidth = 400
  chartIsLoaded: Boolean = false;
  chartShown: String = '';

  // MODULE VARS SELECTED
  selectedModules: any = '';
  isSelectedChallange: boolean = false;
  ModuleForm: FormGroup;
  ModuleFormChallenge: FormGroup;
  ModuleFormSub: FormGroup;
  isModuleFormSubmitted: boolean = false;
  opportunityDetails: any = [];
  problemDetails: any = [];
  moduleGoals: any = [];
  moduleAttachments: any = [];
  selectedPanel: any = "";
  plans: any = [];
  moduleType: any = 'goal';
  moduleDetails: any = [];

  // ORG HIERARCHY TREE
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


  // LOGIN
  selectedUser: any;
  currentUrl: any;
  parentPlanForm: FormGroup;
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

  // MULTISELECT DROPDOWN
  selectedUsers = [];
  users: any = [];
  selectedModItem: boolean = false;
  final = [];
  datafinal = this.final;
  childUsers: any = [];
  childUsersList: any = [];
  selectedSharedPlanUser: any = [];

  // COACH DETAIL VARS
  coachesDetails: any = [];

  // Invite User
  designations: any = [];
  inviteUserForm: FormGroup;
  selectedDomain: any = '';
  currentUserId;
  parent_user_id: any;
  instructionBoxOpen: Boolean = false;
  InviteUserForm: FormGroup;
  isInviteUserFormValid = false;

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
    this.userid = this.currentuser.user._id;
    this.toDate = calendar.getToday();
    this.fromDate = calendar.getPrev(calendar.getToday(), 'm', 1);
  }

  // Init Form Construction Vars
  formfield = [{ name: '', type: '', required: '', label: '', value: '', userid: '' }]
  customFormField = [{
    name: '',
    type: '',
    required: '',
    label: '',
    value: '',
    user_id: ''
  }]
  selectoption = [{ id: '' }]

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedPhase = 'project'
      this.getplanform()
      if (params && params.phase && params.phase != '') {
        this.planId = params.planId;
        this.getPlanDetailMain(params.planId);
        this.getHeadUpToDisplayDetails(params.planId);
      }
    });
    this.getPlanDetails();

    this.buildFormTemplates();
    this.buildDataTableTemplates();
    this.getPlansSharedWithUser();

    $('#date-input5').on('changeDate', function (ev) {
      $(this).datepicker('hide');
    });
    $('#date-input6').on('changeDate', function (ev) {
      $(this).datepicker('hide');
    });

    console.log(this.ngOnInit.name)
  }

  buildFormTemplates(){
    this.childPlanForm = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      shared_users: [''],
      production_target: [''],
      production_type: [''],
      production_weight: [''],
      expense_target: [''],
      expense_weight: [''],
      personal_expense_variance: [0],
      personal_production_variance: [0],
      manager_expense_variance: [0],
      manager_production_variance: [0],
      attachments: []
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
      production_weight: [''],
      expense_target: [''],
      expense_weight: [''],
      personal_expense_variance: [0],
      personal_production_variance: [0],
      manager_expense_variance: [0],
      manager_production_variance: [0]
    })
    this.ModuleForm = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      description: [''],
      production_target: [0],
      production_weight: [0],
      expense_target: [0],
      expense_weight: [0],
      security: ['public'],
      question: [''],
      answer: [''],
      source: [''],
      link: [''],
      intelligence_value: [''],
      intelligence_response: [''],
      attachments: [''],
      personal_expense_variance: [0],
      personal_production_variance: [0],
      manager_expense_variance: [0],
      manager_production_variance: [0]
    });
    this.ModuleFormChallenge = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      description: [''],
      production_target: [0],
      production_weight: [0],
      expense_target: [0],
      expense_weight: [0],
      security: ['public'],
      question: [''],
      answer: [''],
      source: [''],
      link: [''],
      intelligence_value: [''],
      intelligence_response: [''],
      attachments: [''],
      personal_expense_variance: [0],
      personal_production_variance: [0],
      manager_expense_variance: [0],
      manager_production_variance: [0]
    });
    this.ModuleFormSub = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: [''],
      production_target: [0],
      production_weight: [0],
      expense_target: [0],
      expense_weight: [0],
      security: ['public'],
      question: [''],
      answer: [''],
      source: [''],
      link: [''],
      intelligence_value: [''],
      intelligence_response: [''],
      attachments: [''],
      personal_expense_variance: [0],
      personal_production_variance: [0],
      manager_expense_variance: [0],
      manager_production_variance: [0]
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
    this.parentPlanForm = this.formBuilder.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      shared_users: [''],
      production_target: [''],
      production_type: [''],
      production_weight: [''],
      expense_target: [''],
      expense_weight: [''],
      personal_expense_variance: [0],
      personal_production_variance: [0],
      manager_expense_variance: [0],
      manager_production_variance: [0],
      attachments: [],
      security: ['0'],
      numbers: [''],
      share_users: [''],

    })
    this.parentPlanForm.get('security').setValue('0');
  }
  buildDataTableTemplates(){
      this.dtOptionsVote = {
        columnDefs: [{ orderable: false, targets: [1] }],
        pagingType: "full_numbers",
        pageLength: 10,
      };
      this.dtTriggerVote.next();
      this.dtOptionsSelect = {
        columnDefs: [{ orderable: false, targets: [1] }],
        pagingType: "full_numbers",
        pageLength: 10
      };
      this.dtTriggerSelect.next();
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
      this.dtOptionsCountdown = {
        columnDefs: [
          { orderable: false, targets: [1] }
        ],
        pagingType: 'full_numbers',
        pageLength: 10,
      };
      this.dtTriggerCountdown.next();
      this.dtOptionsLaunch = {
        columnDefs: [
          { orderable: false, targets: [1] }
        ],
        pagingType: 'full_numbers',
        pageLength: 10,
      };
      this.dtTriggerLaunch.next();
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
      this.dtOptionsModule = {
        columnDefs: [
          { orderable: false, targets: [1] }
        ],
        pagingType: 'full_numbers',
        pageLength: 10,
      };
      this.dtTriggerModule.next();
      this.dtOptionsPlanGoals = {
        columnDefs: [
          { orderable: false, targets: [1] }
        ],
        pagingType: 'full_numbers',
        pageLength: 10,
      };
      this.dtTriggerPlanGoals.next();
      this.dtOptionsCoaches = {
        columnDefs: [
          { orderable: false, targets: [1] }
        ],
        pagingType: 'full_numbers',
        pageLength: 10,
      };
      this.dtTriggerCoaches.next();
  }

  throwToastrError(message: string){
    console.log(this.throwToastrError.name)
    return this.toastr.error(message)
  }

  openFeedbackModal() {
    console.log(this.openFeedbackModal.name)
    this.feedbackModalOpen = !this.feedbackModalOpen;
    this.commonService.PostAPI('users/get/user', 'ehi@planningsynergies.com')
  }
  clearFeedbackForm() {
    console.log(this.clearFeedbackForm.name)
    this.FeedbackForm.reset()
  }
  submitFeedbackForm(){
    console.log(this.submitFeedbackForm.name)
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

// NEEDS FIX
  deletePlanById(plan) {
    console.log(this.deletePlanById.name)
    $("#project-item-tree").jstree().destroy();
    this.selecteStage("create")
    this.selectPhase("project")
    this.commonService.PostAPI(`plan/delete`, {
      plan_id: plan,
      user_id: this.currentUserId
    }).then((res: any)=>{
      if (res.status) {
        this.toastr.success(res.message, "Success")
      }
      else {
        this.toastr.error(res.message, "Error")
      }
    })
  }

  toggleChallengeTreeView(type: String){
    console.log(this.toggleChallengeTreeView.name)
    let challengeViewSelection = $('#challenge-type-selector-tree').val();
    this.challengeView = type !== '' ? type : challengeViewSelection;
    this.getChallengeTreeDetails(this.challengeView)
  }
  toggleModuleTreeView(type: String){
    console.log(this.toggleModuleTreeView.name)
    let moduleViewSelection = $('#module-type-selector-tree').val();
    this.moduleView = type !== '' ? type : moduleViewSelection;
    this.getModuleTreeDetails(this.moduleView)
  }
  toggleChallengeModuleTreeView(type: String){
    console.log(this.toggleChallengeModuleTreeView.name)
    let challengeModuleViewSelection = $('#challenge-module-type-selector-tree').val();
    this.challengeModuleView = type !== '' ? type : challengeModuleViewSelection;
    this.getChallengeModuleTreeDetails(this.challengeModuleView)
  }

  toggleChallengeFormType(){
    console.log(this.toggleChallengeFormType.name)
    let selection = $('#challenge-type-selector').val();
    if(selection !== ''){
      this.challengeSelected = true;
      this.selectChallenge(selection)
      this.toggleChallengeTreeView(selection)
    }
    $('#challenge-type-selector-tree').val(selection);
  }
  toggleModuleFormType(){
    console.log(this.toggleModuleFormType.name)
    let selection = $('#module-type-selector').val();

    if(selection !== ''){
      this.moduleSelected = true;
      this.selectModule(selection);
      this.toggleModuleTreeView(selection)
    }
    $('#module-type-selector-tree').val(selection);
  }
  toggleChallengeModuleFormType(){
    console.log(this.toggleChallengeModuleFormType.name)
    let selection = $('#challenge-module-type-selector').val();
    if(selection !== ''){
      this.moduleSelected = true
      this.selectedModules = selection
      this.toggleChallengeModuleTreeView(selection)
    }
    $('#challenge-module-type-selector-tree').val(selection);
  }

// BUILDS AND CLEANS PROJECT TREE BASED ON CURRENT USER PLANS AND GOALS
  async getPlanDetails() {
    console.log(this.getPlanDetails.name)
    this.projectTreePlanItems = [];
    this.plansArrayForTree = [];
    if (this.currentchildUser == null) {
      this.currentchildUser = []
    }
    if (this.currentparentUser == null) {
      this.currentparentUser = []
    }
    await this.getSharedPlansInTreeFormat( this.currentuser.user._id, [] );
    await this.getUserPlansInTreeFormat(this.currentuser.user._id, []);
    this.buildDatePickerByType('plan')

    };
  async getSharedPlansInTreeFormat(user_id: string, child_ids: Array<any>){
    console.log(this.getSharedPlansInTreeFormat.name)
    await this.commonService.PostAPI('goal/plangoal/tree/shared', { id: user_id, childids: child_ids }).then((response: any) => {
      this.projectTreePlanItems = response.data
    })
  }
  async getUserPlansInTreeFormat(user_id: string, child_ids: Array<any>){
    console.log(this.getUserPlansInTreeFormat.name)
    await this.commonService.PostAPI('goal/plangoal/tree', { id: user_id, childids: child_ids }).then((response: any) => {
      if (response.status) {
        response.data.map((item)=>{
          this.projectTreePlanItems.push(item)
        })
        this.projectTreePlanItems.forEach(element => {
          this.plansArrayForTree.push({ "id": element._id, "parent": "#", "text": element.short_name, 'state': { 'opened': true }, "icon": "assets/images/avatars/p.png"})
          element.goals.forEach(element2 => {
            let parsedArrayOfItems = element2.parent_goal_id
            if (element2.module_type == 'goal') {
              if (parsedArrayOfItems[parsedArrayOfItems.length - 1] !== '#'){
                var moduleTypeIcon: any = "assets/images/avatars/g.png";
                this.plansArrayForTree.push({ "id": element2._id, "parent": parsedArrayOfItems[parsedArrayOfItems.length - 1], "text": element2.short_name, "icon": moduleTypeIcon, priority: element2.prioritize  })
              }
              else {
                var moduleTypeIcon: any = "assets/images/avatars/g.png";
                this.plansArrayForTree.push({ "id": element2._id, "parent": element._id, "text": element2.short_name, "icon": moduleTypeIcon, priority: element2.prioritize  })
              }
            }})
            this.plansArrayForTree = this.plansArrayForTree.sort((goalA: any, goalB: any)=> {return goalA.priority - goalB.priority})
        });
        this.projectTreeImp()
      }
  })}
  projectTreeImp(){
    console.log(  this.projectTreeImp.name)
    const ITEM_PLAN_CLASS = this;
    $('#project-item-tree').jstree("destroy");
    $("#project-item-tree").on("select_node.jstree",
      function (evt, data) {
        var plan_id;
        ITEM_PLAN_CLASS.selectedChildGoalDetails = []
        ITEM_PLAN_CLASS.editChildEnabled = false;

        if (data.node.parent == "#") {
          ITEM_PLAN_CLASS.getPlanDetailMain(data.selected[0]);
          ITEM_PLAN_CLASS.getGoalReportByPlan(data.selected[0]);
          plan_id = data.selected[0];
          ITEM_PLAN_CLASS.planId = plan_id;
          ITEM_PLAN_CLASS.parentIsActiveSelection = true;
          ITEM_PLAN_CLASS.selectedChildGoalDetails = {}
          ITEM_PLAN_CLASS.resestUIVarsPlans()
        }
        else if (data.node.parent !== '#' && data.node.parents.length < 3) {
          ITEM_PLAN_CLASS.getSelectedChildGoalDetails(data.selected[0], data.node.parent);
          ITEM_PLAN_CLASS.getGoalReportByPlan(data.node.parent);
          ITEM_PLAN_CLASS.parentIsActiveSelection = false;
          plan_id = data.node.parent;
          ITEM_PLAN_CLASS.planId = plan_id;
          ITEM_PLAN_CLASS.childGoalId = ""
          ITEM_PLAN_CLASS.childParentId = data.node.parent
          ITEM_PLAN_CLASS.getGoalAttachments(data.selected[0]);
          ITEM_PLAN_CLASS.getGoalSharedUsers(data.selected[0]);
          ITEM_PLAN_CLASS.resestUIVarsPlans()
        }
        else {
          ITEM_PLAN_CLASS.getSelectedChildGoalDetails(data.selected[0], data.node.parent);
          ITEM_PLAN_CLASS.getGoalReportByPlan(data.node.parent);
          ITEM_PLAN_CLASS.parentIsActiveSelection = false;
          ITEM_PLAN_CLASS.childParentId = data.node.parent
          ITEM_PLAN_CLASS.childGoalId = data.selected[0]
          plan_id = data.node.parents[data.node.parents.length - 2]
          ITEM_PLAN_CLASS.planId = plan_id;
          ITEM_PLAN_CLASS.getGoalAttachments(data.selected[0]);
          ITEM_PLAN_CLASS.getGoalSharedUsers(data.selected[0]);
          ITEM_PLAN_CLASS.resestUIVarsPlans()
        }

        ITEM_PLAN_CLASS.cleanUpUIPlans(plan_id)
      }
    );
    $('#project-item-tree').jstree({ core: { data: this.plansArrayForTree } });
  }


  resestUIVarsPlans(){
    console.log(this.resestUIVarsPlans.name)
  this.editChildEnabled = false;
  this.moduleItemActive = false;
  this.challengeItemSelected = false;
  this.itemSelected = true;
  }
  cleanUpUIPlans(plan_id){
    console.log(this.cleanUpUIPlans.name)
  this.getHeadUpToDisplayDetails(plan_id);
  this.selectedPhase = 'B';
  this.moduleType = 'goal';
  this.challengeView = 'problem';
  this.moduleView = 'strategy'
  this.getModuleTreeDetails('strategy');
  this.getChallengeTreeDetails('problem');

  // For now, we reset these vals to maintain a default template state
  $('#module-type-selector-tree').val('strategy');
  $('#challenge-type-selector-tree').val('problem');

  this.selectedModules = '';
  this.selectedChallenge = ''
  this.moduleItemActive = false;
  this.challengeItemSelected = false;
  this.getPlanGoals(plan_id, 'goal');
  this.dataTableAfterViewInit()

  if(this.challengeSelected){
    this.challengeSelected = false;
    $('#challenge-type-selector').val('')
  }

  if(this.moduleSelected){
    this.moduleSelected = false;
    $('#module-type-selector').val('')
  }
  }

// INITIATES WHEN PLAN/GOAL IS LAUNCHED UNDER LAUNCH
  sendForReport(event){
    console.log(this.sendForReport.name)
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
    let type: String;
    if(this.challengeItemSelected){
      type = this.selectedChallenge
    }
    else if(this.moduleItemActive){
      type = this.selectedModules
    }
    else {
      type = 'goal'
    }
    this.getLaunchGoals(this.planId, type)
  }

// SHOULD USE THE CURRENT PLAN ID IF DISPLAYING W/ TREE
// SHOULD USE 'SELECTED' PLAN ID IF DISPLAYING SELECTED OUTSIDE OF TREE
// LOADS planGoals VAR
  getPlanGoals(planid, type: any) {
    console.log(this.getPlanGoals.name)
    this.commonService.PostAPI(`goal/getgoals/bypid`, { id: planid, module_type: type }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.planGoals = response.data;
        if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
          this.planGoals = this.planGoals.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
        }
        else {
          this.planGoals = this.planGoals.filter((goal)=>{
            if(goal.plan_id === this.planId){
              return goal.parent_goal_id.length === 1
            }
          })
        }
      } else {
        this.planGoals = [];
      }
      $("#table-goals").dataTable().fnDestroy();
    });
  }

// GETS ANY ATTACHMENTS WITH THEIR GOALS
  getGoalAttachments(goal_id) {
    console.log(this.getGoalAttachments.name)
    this.commonService.PostAPI(`goal/get/attachments`, { goal_id: goal_id }).then((response: any) => {
      if (response.status) {
        this.goalAttachments = response.data;
      } else {
        this.goalAttachments = []
      }
    });
  }

// GETS ANY SHARED USER STATS BASED ON THE ENTERED GOAL ID
  getGoalSharedUsers(goal_id) {
    console.log(this.getGoalSharedUsers.name)
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

// LOADS THE HUD
  getHeadUpToDisplayDetails(plan_id) {
    console.log(this.getHeadUpToDisplayDetails.name)
    this.commonService.PostAPI(`plan/get/hud/details`, { plan_id: plan_id }).then((response: any) => {
      if (response.status) {
        this.planHudDetails = response.data;
        console.log(this.planHudDetails)
      } else {
        this.planHudDetails = '';
      }
    });
  }

// NECESSARY FOR DISTINGUISHING EDITS FROM NEW SUBMISSIONS
  toggleEditGoal(){
    console.log(this.toggleEditGoal.name)
    this.editChildEnabled = !this.editChildEnabled
  }

// EDITING/UPDATING FUNCTIONALITY LIMITED TO BEFORE PROPOSAL
// DEPENDENT ON goal_id VAR
  updateGoal(){
    console.log(this.updateGoal.name)
    if(!this.parentIsActiveSelection && this.selectedChildGoalDetails){
      let goal_id = this.selectedChildGoalDetails._id;

      this.commonService.PatchAPI('goal/update/goal', {
        _id: goal_id,
        user_id: this.currentuser.user._id,
        data: this.childPlanForm.value
      }).then((res: any)=>{
        if(res.status){
          this.toastr.success(res.message, 'Success!');
          this.editChildEnabled = !this.editChildEnabled
          this.getSelectedChildGoalDetails(goal_id, this.selectedChildGoalDetails.parent_goal_id[this.selectedChildGoalDetails.parent_goal_id.length - 1])
          this.getPlanDetails()
        }
        else {
          this.toastr.error(res.message, 'Error!');
        }
      })
    }
    else {
      this.toastr.error("Please select a goal item first.", "Error")
    }
  }

// DOUBLE CHECK RESPONSE MESSAGE FROM BACKEND WHEN POSSIBLE
  getSelectedChildGoalDetails(goal, parent) {
    console.log(this.getSelectedChildGoalDetails.name)
    this.commonService.PostAPI(`goal/get/by/id`, { goal_id: goal }).then((response: any) => {
      if (response.status) {
        this.selectedChildGoalDetails = response.data;
        this.validateEditingStatus()
        this.moduleType = this.selectedChildGoalDetails.module_type;
        if (this.selectedChildGoalDetails.parent_goal_id !== '#'){
          this.childGoalId = this.selectedChildGoalDetails.parent_goal_id
        }
        else {
          this.childGoalId = this.selectedChildGoalDetails._id
        }
        this.patchRelatedGoalForm();
        if(this.challengeItemSelected){
          this.getChallengeModuleTreeDetails('strategy')
        }
      }
      else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  patchRelatedGoalForm(){
    console.log(this.patchRelatedGoalForm.name)
    const DATE_PIPE = new DatePipe("en-US");
        $('#date-input5').datepicker('setDate',  DATE_PIPE.transform(this.selectedChildGoalDetails.start_date, 'MM/dd/yyyy'));
        $('#date-input6').datepicker('setDate', DATE_PIPE.transform(this.selectedChildGoalDetails.end_date, 'MM/dd/yyyy'));

    if(this.selectedModules === '' || this.selectedModules === undefined){
      this.formPatcher('goal', DATE_PIPE)
    }
    else {
      this.moduleItemActive = true;
      this.formPatcher('module', DATE_PIPE)
    }
  }
  formPatcher(form_type: String, DATE_PIPE: DatePipe){
    console.log(this.formPatcher.name)
    switch (form_type){
      case 'module':
        this.ModuleForm.patchValue({
          short_name: this.selectedChildGoalDetails.short_name,
          long_name: this.selectedChildGoalDetails.long_name,
          description: this.selectedChildGoalDetails.description,
          start_date: DATE_PIPE.transform(this.selectedChildGoalDetails.start_date, 'MM/dd/yyyy'),
          end_date: DATE_PIPE.transform(this.selectedChildGoalDetails.end_date, 'MM/dd/yyyy'),
          expected_target: this.selectedChildGoalDetails.expected_target,
          revenue_target: this.selectedChildGoalDetails.revenue_target,
          shared_users: this.selected,
          production_target: this.selectedChildGoalDetails.production_target,
          production_type: this.selectedChildGoalDetails.production_type,
          personal_production_variance: this.selectedChildGoalDetails.personal_production_variance,
          personal_expense_variance: this.selectedChildGoalDetails.personal_expense_variance,
          production_weight: this.selectedChildGoalDetails.production_weight,
          expense_target: this.selectedChildGoalDetails.expense_target,
          expense_weight: this.selectedChildGoalDetails.expense_weight,
        })
        break;
      case 'goal':
        this.childPlanForm.patchValue({
            short_name: this.selectedChildGoalDetails.short_name,
            long_name: this.selectedChildGoalDetails.long_name,
            description: this.selectedChildGoalDetails.description,
            start_date: DATE_PIPE.transform(this.selectedChildGoalDetails.start_date, 'MM/dd/yyyy'),
            end_date: DATE_PIPE.transform(this.selectedChildGoalDetails.end_date, 'MM/dd/yyyy'),
            expected_target: this.selectedChildGoalDetails.expected_target,
            revenue_target: this.selectedChildGoalDetails.revenue_target,
            shared_users: this.selected,
            production_target: this.selectedChildGoalDetails.production_target,
            production_type: this.selectedChildGoalDetails.production_type,
            personal_production_variance: this.selectedChildGoalDetails.personal_production_variance,
            personal_expense_variance: this.selectedChildGoalDetails.personal_expense_variance,
            production_weight: this.selectedChildGoalDetails.production_weight,
            expense_target: this.selectedChildGoalDetails.expense_target,
            expense_weight: this.selectedChildGoalDetails.expense_weight,
          });
          break;
      default:
          this.toastr.error("Failed to retrieve details, please try again later.", "Error")
          this.selecteStage('create')
          break;
    }
  }
  validateEditingStatus(){
    console.log(this.validateEditingStatus.name)
    if (this.currentuser.user._id == this.selectedChildGoalDetails.user_id) {
      this.editingStatus = true;
    } else {
      this.editingStatus = false;
    }
  }
  buildDatePickerByType(type: String){
    console.log(this.buildDatePickerByType.name)
    switch (type){
      case 'goal':
        $('#date-input-goal').datepicker({
          dateFormat: "mm-dd-yy",
          setDate: new Date(),
          todayHighlight: true,
        });
        $('#date-input-goal-end').datepicker({
          setDate: new Date(),
          todayHighlight: true,
          startDate: new Date(this.selectedParentPlanDetails[0].start_date),
        });
        $('#date-input-goal').datepicker().on('changeDate', function (e) {
          $('#date-input-goal').datepicker('hide');
        });
        $('#date-input-goal-end').datepicker().on('changeDate', function (e) {
          $('#date-input-goal-end').datepicker('hide');
        });
      case 'module':
        $('#module-start-date-challenge').datepicker({
          dateFormat: "mm-dd-yy",
          setDate: new Date(),
          todayHighlight: true,
        });
        $('#module-end-date-challenge').datepicker({
          setDate: new Date(),
          todayHighlight: true,
          startDate: new Date(this.selectedParentPlanDetails[0].start_date),
        });

        $('#module-start-date-challenge').datepicker().on('changeDate', function (e) {
          $('#module-start-date-challenge').datepicker('hide');
        });

        $('#module-end-date-challenge').datepicker().on('changeDate', function (e) {
          $('#module-end-date-challenge').datepicker('hide');
        });
        break;
      case 'plan':
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
          break;
      default:
        this.toastr.warning("Failed to build calendars, problems with dates may occur.", "Warning")
    }
  }

// SETS selectedParentPlanDetails AND PARENT VARS
  getPlanDetailMain(Plan) {
    console.log(this.getPlanDetailMain.name)
    this.editingStatus = true

    this.commonService.PostAPI(`plan/get/by/id2`, { plan_id: Plan }).then((response: any) => {
      if (response.status) {
        this.selectedParentPlanDetails = response.data;
        if(this.parentIsActiveSelection){
          this.childGoalId = ""
        }
        this.planstartdate = this.selectedParentPlanDetails[0].start_date;
        this.planenddate = this.selectedParentPlanDetails[0].end_date;
        this.goalplanid = this.selectedParentPlanDetails[0]._id;
        this.goalPlanName = this.selectedParentPlanDetails[0].short_name;
        this.plansecurity = this.selectedParentPlanDetails[0].security;

        this.ModuleForm.reset();
        this.buildDatePickerByType('module')
        this.buildDatePickerByType('goal')

        // RE-INIT CHILD PLAN FORM
        this.childPlanForm.reset();
        this.childPlanForm.get('production_type').setValue(this.selectedParentPlanDetails[0].production_type)
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  reset() {
    console.log(this.reset.name)
    this.submitted = false;
    this.childPlanForm.reset();
    this.attachments = [];
  }

// SETS selectedParentPlanDetails, goalplanid, and goalPlanName
// PARENT VARS SET AS WELL
// ODD FUNCTION OUT OF THE BUNCH
  getPlanDetailAlt(Plan) {
    console.log(this.getPlanDetailAlt.name)
    this.commonService.PostAPI(`plan/get/by/id2`, { plan_id: Plan }).then((response: any) => {
      if (response.status) {
        this.selectedParentPlanDetails = response.data;
        this.goalplanid = this.selectedParentPlanDetails[0]._id;
        this.planstartdate = this.selectedParentPlanDetails[0].start_date;
        this.planenddate = this.selectedParentPlanDetails[0].end_date;
        this.goalPlanName = this.selectedParentPlanDetails[0].short_name;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

// convenience getter for easy access to form fields
  get f() { return this.childPlanForm.controls; }


// PLAN AND GOAL ITEM SUBMISSIONS
  onSubmit() {
    console.log(this.onSubmit.name)
    // THIS IS WHERE RESET() IS NECESSARY
    this.submitted = true;
    this.challengeSelected = false;
    // NEED TO REVIEW INVALIDITY AND HANDLING OF ERRORS
    if (this.childPlanForm.invalid) {
      return;
    } else {
      // IF getPlanDetailAlt() FOUND A RESP
      if (this.goalplanid != undefined) {
        if ($('#date-input-goal').val() != '' && $('#date-input-goal-end').val() != '') {
          var data = this.childPlanForm.value;
            data.editid = ""
          data.user_id = this.currentuser.user._id;
          data.plan_id = this.goalplanid;
          data.status = 0;
          data.numbers = 0;
          data.start_date = $('#date-input-goal').val();
          data.end_date = $('#date-input-goal-end').val();
          data.shared_users = this.selected.map((data) => data.id);
            if (this.moduleType == '') {
              this.moduleType = 'goal';
            }
          data.module_type = 'goal';
          const formData: any = new FormData();

          const files: Array<File> = this.attachments;
          for (let i = 0; i < files.length; i++) {
            formData.append("attachments", files[i], files[i]['name']);
            console.log(files, this.attachments)
          }
          for (const key in data) {
            const element = data[key];
            formData.append(key.toString(), element);
          }

          this.commonService.PostAPI(`goal/create`, formData).then((response: any) => {
            if (response.status) {
              this.toastr.success(response.message, "Success");
              this.getPlanDetails();
              this.getPlanGoals(this.goalplanid, 'goal');
              this.reset();
            } else {
              this.toastr.error(response.message, "Error");
            }
          });
        } else {
          if ($('#date-input5').val() == '') {
            this.toastr.error("Please Enter Start Date", "Error");
          } else if ($('#date-input6').val() == '') {
            this.toastr.error("Please Enter End Date", "Error");
          } else {
            return;
          }
        }
      } else {
        this.toastr.error("Please Select Project First!!", "Error");
      }
    }
  }
  onSubmitSub(){
    console.log(this.onSubmitSub.name)
    this.submitted = true;
    if (this.childPlanFormSub.invalid) {
      return;
    } else {
      if (this.goalplanid != undefined) {
        if ($('#date-input5').val() != '' && $('#date-input6').val() != '') {

              var data = this.childPlanFormSub.value;
              console.log(this.selectedChildGoalDetails)
              const parsedArrayOfItems = this.selectedChildGoalDetails.parent_goal_id
              console.log(parsedArrayOfItems)
              parsedArrayOfItems.push(this.selectedChildGoalDetails._id)
              data.editid = "";
              data.parent_goal_id = parsedArrayOfItems;
              data.user_id = this.currentuser.user._id;
              data.plan_id = this.goalplanid;
              data.status = 0;
              data.numbers = 0;
              data.start_date = $('#date-input5').val();
              data.end_date = $('#date-input6').val();
              data.shared_users = this.selected.map((data) => data.id);
              console.log(data)
             this.moduleType = 'goal';

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
                  this.getPlanGoals(this.goalplanid, 'goal');
                  this.childPlanFormSub.reset()
                  this.reset();
                } else {
                  this.toastr.error(response.message, "Error");
                }
              });
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



  // Migrate to only exec under 'Report' or 'Measure'
  getGoalReportByPlan(plan_id) {
    console.log(this.getGoalReportByPlan.name)
    this.commonService.PostAPI(`plan/get/goal/report`, { plan_id: plan_id }).then((response: any) => {
      if (response.status) {
        this.goalReportDetails = response.data
        console.log(this.goalReportDetails)
      } else {
        this.goalReportDetails = '';
      }
    });
  }

// Converts string inputs to HTML in the UI (Used for various VARS)
  textDecoration(string) {
    var newString = string.replace(/_/g, " ");
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }
warnUser(message){
  console.log(this.warnUser.name)
  return this.toastr.warning(message, 'Warning')
}
// Attachment related functions
  uploadFile(event) {
    console.log(this.uploadFile.name)
    this.attachments = event;
  }
  deleteAttachment(index) {
    console.log(this.deleteAttachment.name)
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
    console.log(this.getFileExtenstion.name)
    return filename.split('?')[0].split('.').pop();
  }
  isImage(filename) {
    console.log(this.isImage.name)
    var allowExtensions = ['jpg', 'jpeg', 'png', 'gif']
    var extenstion = filename.split('?')[0].split('.').pop();

    if (allowExtensions.includes(extenstion) == true) {
      return true;
    } else {
      return false;
    }
  }
  deleteGoalAttachment(goal_attachment_id, goal_id) {
    console.log(this.deleteGoalAttachment.name)
    this.commonService.PostAPI(`goal/attachments/delete`, { goal_attachment_id: goal_attachment_id }).then((response: any) => {
      if (response.status) {
        this.getGoalAttachments(goal_id)
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

// Shared user and permission functions
  getPlansSharedWithUser() {
    console.log(this.getPlansSharedWithUser.name)
    this.commonService.PostAPI(`plan/check/user/permission`, { user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.sharedPlanPermission = response.data.map(data => data._id);
        console.log(this.sharedPlanPermission, response.data)
      }
    });
  }


// Selection functions for traversing the HUD
  onChange(e) {
    console.log(this.onChange.name)
    this.selected = e;
  }
  selecteStage(type: any) {
    console.log(this.selecteStage.name)
    this.selectedStage = type;
    if(type === 'create'){
      this.planGoals = []
      this.parentIsActiveSelection = false;
      this.selectedChildGoalDetails = {}
      this.selectedParentPlanDetails = []
      $("#project-tree").jstree("deselect_all")
      $('#jstree-challenge-tree').jstree("destroy");
      $('#jstree-module-tree').jstree("destroy");
      this.getPlanDetails()
      this.itemSelected = false;
      this.challengeItemSelected = false;
      this.moduleItemActive = false;
    }
    if(this.selectedParentPlanDetails.length >= 1){
      this.getPlanGoals(this.selectedParentPlanDetails[0]._id, 'goal')
    }
    else {
      return;
    }
  }
  selectPhase(type: any) {
    console.log(this.selectPhase.name)
    if (this.planId && this.planId !== '') {
      // this.selectedModules = '';
      this.selectedPhase = type;
      let altType: String = '';
      if(this.challengeItemSelected){
        altType = this.selectedChallenge
      }
      else if(this.moduleItemActive){
        altType = this.selectedModules
      }
      else {
        altType = 'goal'
      }

      if (type == 'D') {
        this.getgoal(this.planId, altType);
      }

      if (type == 'P') {
        this.getPriorityGoals(this.planId, altType);

      }

      if (type == 'PR') {
        this.getProposeGoals(this.planId, altType);
      }

      if (type == 'V') {
        this.getVoteGoals(this.planId, altType);

      }

      if (type == 'S') {
        this.getSelectGoals(this.planId, altType);

      }

      if (type == 'DG') {
        this.getDelegateGoals(this.planId, altType);
        this.getalldelegategoals();

      }

      if (type == 'C') {
        this.getCountdownGoals(this.planId, altType);
      }

      if (type == 'L') {

        this.getLaunchGoals(this.planId, altType);
      }

      if (type == 'R') {

        this.getReportGoals(this.planId);
      }

      if (type == 'M') {
        if(this.parentIsActiveSelection && !this.challengeItemSelected && !this.moduleItemActive){
          // this.getPlanGoalDetails();
          // this.getReportSum(this.selectedParentPlanDetails[0]._id);
          // this.initMeasureCharts(true)
          this.selectedPhase = 'R'
          this.toastr.error('That functionality is currently under construction, check back often for updates! - Rapifly Dev Team', 'Whoops')
        }
        else {
          this.selectedPhase = 'R'
          this.toastr.error('That functionality is currently under construction, check back often for updates! - Rapifly Dev Team', 'Whoops')
        }
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
      if (this.plansArrayForTree.length) {
        this.toastr.error("Please select any plan from Project Tree in left pannel.", "Error")
      } else {
        this.toastr.error("You need to create any plan first.", "Error")
      }
    }
  }

// This is used with reports to get calculated summaries from vals
  async getReportSum(planid){
    console.log(this.getReportSum.name)
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
  getMeasureStats(prodSum, expSum){
    console.log(this.getMeasureStats.name)
    // Burn Rates
    this.grossBurnRate = expSum
    this.netBurnRate = this.grossBurnRate - prodSum

    // Average Production Rate
    this.avgProdSum = this.datasetProd.reduce((next, curr)=>{
      return next + curr;
    }, 0)
    this.avgProd = (this.avgProdSum/this.datasetProd.length).toFixed(2)

  }
  showChart(type: String){
    console.log(this.showChart.name)
    console.log(type)
    switch(type){
      case 'line': {
        this.chartShown = 'line'
        break;
      }
      case 'bar': {
        this.chartShown = 'bar'
        break;
      }
    }
  }
  initMeasureCharts(validator: Boolean){
    console.log(this.initMeasureCharts.name)
    if(validator && !this.selectedChallenge && !this.moduleItemActive && this.parentIsActiveSelection){
      this.commonService.PostAPI(`report/get/all`, { plan_id: this.planId, user_id: this.currentuser.user._id }).then((response: any) => {
        if (response.status && response.data && response.data.length > 0) {
          this.reportGoals = response.data.filter(report => {return report.element.isReportReady});
          let reports = response.data.map(report => {return {end_date: report.element.end_date, actual_expense: report.actual_expense, actual_production: report.actual_production}})

          // Sum of actual expenses AND production
          // Sort does NOT matter here
          this.actualExpenseSum = response.data.reduce((reportA, reportB)=> {
            return reportA + reportB.actual_expense
          }, 0)

          this.actualProductionSum = response.data.reduce((reportA, reportB)=> {
            console.log(reportA, reportB)
            return reportA + reportB.actual_production
          }, 0)

          // Expense and Prod data sorted and summed by date
          // Check sort here
          var dataExp = reports.sort((reportA: any, reportB: any)=>{
            return new Date(reportA.end_date).getDate() - new Date(reportB.end_date).getDate()
          }),
          expResult = [];
          // Combine same dates
          for (let { end_date, actual_expense } of dataExp) {
              end_date = end_date.slice(0, 10);
              let temp;
              if(expResult.length > 0){
                temp = expResult.find(q => q.end_date.slice(0, 10) === end_date); // look for same data
              }                                  // take yyyy-mm-dd only
              if (temp) temp.actual_expense += actual_expense;                               // if found add to y
              else expResult.push({ end_date: end_date + 'T00:00:00.000Z', actual_expense });    // if not create object and push
          }

          var dataProd = reports.sort((reportA: any, reportB: any)=>{
            return new Date(reportA.end_date).getDate() - new Date(reportB.end_date).getDate()
          }),
          prodResult = [];
          // Combine same dates
          for (let { end_date, actual_production } of dataProd) {
              end_date = end_date.slice(0, 10);
              let temp;
              if(prodResult.length > 0){
                temp = prodResult.find(q => q.end_date.slice(0, 10) === end_date); // look for same data
              }                                  // take yyyy-mm-dd only
              if (temp) temp.actual_production += actual_production;                               // if found add to y
              else prodResult.push({ end_date: end_date + 'T00:00:00.000Z', actual_production });    // if not create object and push
          }


          // Line Chart
          // Resets chart vars
          if(this.datasetTotal.length > 0){
            this.datasetTotal = []
            this.datasetExp = []
            this.datasetProd = []
            this.lineChartMainLabels = []
          }

          // For best and worst project reports
          this.prodHierarchy = response.data.sort((reportA, reportB) => {return reportA.actual_production > reportB.actual_production})
          this.expHierarchy = response.data.sort((reportA, reportB) => {return reportA.actual_expense > reportB.actual_expense})


          // Sort by dates to organize the x-axis
          // When we move to scatter plots, this will be the thing to change
          this.reportGoals.sort((reportA: any, reportB: any)=> {
            return new Date(reportA.element.end_date).getDate() - new Date(reportB.element.end_date).getDate()
          })
          prodResult.sort((reportA: any, reportB: any)=>{
                        return new Date(reportA.end_date).getDate() - new Date(reportB.end_date).getDate()
          })
          expResult.sort((reportA: any, reportB: any)=>{
                        return new Date(reportA.end_date).getDate() - new Date(reportB.end_date).getDate()
          })

          for(let i: any = 0; i < this.reportGoals.length; i++){
            this.datasetProd.push(this.reportGoals[i].actual_production)
            this.datasetExp.push(this.reportGoals[i].actual_expense)
            this.lineChartMainLabels.push( new Date(this.reportGoals[i].element.end_date).toDateString())
            this.lineChartMainLabels = [... new Set(this.lineChartMainLabels)]
          }
          // Crucial that this remains in the correct format for the dep.
          this.datasetTotal.push({
            label: "Production",
            data: this.datasetProd
          }, {
            label: "Expenses",
            data: this.datasetExp
          })

          // Validator for UI to trigger
          this.chartIsLoaded = true

          // Re-Renders Chart
          if(this.chart.chart !== undefined){
            this.chart.chart.data.datasets = this.datasetTotal
            this.chart.chart.data.labels = this.lineChartMainLabels
            this.chart.chart.config.options.defaultColor = '#ff00ff'
            this.chart.chart.update()
          }

          // For summary data ONLY
          this.getMeasureStats(this.actualProductionSum, this.actualExpenseSum)

          }
      })
    }
    else {
      this.datasetTotal = []
      this.toastr.error('That functionality is currently under construction, check back often for updates! - Rapifly Dev Team', 'Whoops')
    }
  }

// Deactivate
  getgoal(planid, type) {
    console.log(this.getgoal.name)
    this.goals = []
    if (planid == '') {
      this.dividearrayintothreepart = 0
    } else {
      this.commonService.PostAPI(`goal/get/all/by/plan`, { id: planid, module_type: type }).then((response: any) => {
        if (response.status && response.data && response.data.length > 0) {
          this.goals = response.data;
          if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
            this.goals = this.goals.filter((goal)=>{
              return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id
            })
          }
          else {
            this.goals = this.goals.filter((goal)=>{
              if(goal.parent_goal_id.length === 1){
                return goal.plan_id === this.selectedParentPlanDetails[0]._id
              }
            })
          }
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
    console.log(this.changedeactivate.name)
    this.commonService.PostAPI(`goal/deactivate/changebyid`, { id: id, deactivate: change }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
        let type: String;
        if(this.challengeItemSelected){
          type = this.selectedChallenge
        }
        else if(this.moduleItemActive){
          type = this.selectedModules
        }
        else {
          type = 'goal'
        }
        this.getgoal(this.planId, type);
        this.getPlanDetails();

        this.showSelectedTree(this.selectedModules)
      } else {
        this.toastr.error(response.message, "Error");
      }
    })
  }

// Priority
  getPriorityGoals(planid, type: any) {
    console.log(this.getPriorityGoals.name)
    if (planid == '') {
      this.isDevidedInParts = 0
    } else {
      console.log(planid)
      console.log(type)
      this.commonService.PostAPI(`goal/getgoals/bypid`, { id: planid, module_type: type }).then((response: any) => {
        if (response.status) {
          console.log(response.data)
          if(this.parentIsActiveSelection){

            // When a parent item is selected, this will filter out items nested deeper than
            this.priorityGoals = response.data.filter((goal)=>{return goal.parent_goal_id.length === 1});
          }
          else {
            // When a child item is selected, this will filter out items unrelated
            this.priorityGoals = response.data.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length-1] === this.selectedChildGoalDetails._id})
          }
        } else {
          this.priorityGoals = [];
        }
      });
    }
  }
  updatepriority(index) {
    console.log(this.updatepriority.name)
    document.getElementById("label-priority-" + index).style.display = "none"
    document.getElementById("priority-text-" + index).style.display = "block"
  }
  updategoalpriority(childGoalId, index) {
    console.log(this.updategoalpriority.name)
    document.getElementById("label-priority-" + index).style.display = "block"
    document.getElementById("priority-text-" + index).style.display = "none"
    var changevalue: any = $("#input-priority-" + index).val();
    changevalue = parseInt(changevalue)

    if (changevalue > 0) {
      this.commonService.PostAPI('goal/update/priority', { goal_id: childGoalId, prioritize: changevalue }).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.getPriorityGoals(this.planId, 'goal');
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    } else {
      this.toastr.error("Priority should be above 0.", "Error");
    }
  }
  changepriority(goal_id, current_priority, new_priority) {
    console.log(this.changepriority.name)
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
        this.getPriorityGoals(this.planId, 'goal');
        this.getPlanDetails()
        this.getModuleTreeDetails(this.selectedModules !== '' ? this.selectedModules : 'strategy')
        this.getChallengeTreeDetails(this.selectedChallenge)
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    })
  }

// Propose
  getProposeGoals(planid, type: any) {
    console.log(this.getProposeGoals.name)
    if (planid == "") {
      this.checkboxshow = false;
      this.isProposeDevidedInParts = 0;
    } else {
      this.commonService.PostAPI(`plan/get/by/id2`, { plan_id: planid }).then((response: any) => {
        if (response.status) {
          if (response.data[0].user_id._id == this.currentuser.user._id) {
            this.commonService.PostAPI(`propose/get/goal/by/plan`, { plan_id: planid, user_id: this.currentuser.user._id, module_type: type }).then((response: any) => {
              if (response.status) {
                console.log(response.data)
                this.proposeGoals = [];
                if(!this.parentIsActiveSelection){
                  this.proposeGoals = response.data.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
                }
                else {
                  this.proposeGoals = response.data.filter((goal)=>{return goal.parent_goal_id.length === 1});
                }
                console.log(this.proposeGoals)
                this.isProposeDevidedInParts = 1;
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
    console.log(this.changeproposal.name)
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
      this.getProposeGoals(this.planId, 'goal');
    });
  }
  handleChange($event, id) {
    console.log(this.handleChange.name)
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
          this.getProposeGoals(this.planId, 'goal');
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
  }

// Vote
  getVoteGoals(planid, type: any) {
    console.log(this.getVoteGoals.name)
    this.commonService.PostAPI(`goal/getgoals/byvote`, { id: planid, module_type: type }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.voteGoals = response.data;
        if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
          this.voteGoals = this.voteGoals.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
        }
        else {
          this.voteGoals = this.voteGoals.filter((goal)=>{
            if(goal.plan_id._id === this.planId){
              return goal.parent_goal_id.length === 1
            }
          })
        }
      } else {
        this.voteGoals = [];
      }
    });
  }
  reloadDatatable() {
    console.log(this.reloadDatatable.name)
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  checkvote(goal) {
    console.log(this.checkvote.name)
    if (goal.voteup.includes(this.currentuser.user._id) == true || goal.votedown.includes(this.currentuser.user._id) == true) {
      return true;
    } else {
      return false;
    }
  }
  dataTableAfterViewInit() {
    console.log(this.dataTableAfterViewInit.name)
    var table = $('#' + this.tableId).DataTable({destroy: true});
    table.destroy();

  }
  resetSearch() {
    console.log(this.resetSearch.name)
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getVoteGoals(this.planId, 'goal');
  }
  changevote(id, change) {
    console.log(this.changevote.name)
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
  getSelectGoals(planId, type: any) {
    console.log(this.getSelectGoals.name)
    this.commonService.PostAPI(`goal/getgoals/byvote`, { id: planId, module_type: type }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.selectGoals = response.data;
        if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
          this.selectGoals = this.selectGoals.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
        }
        else {
          this.selectGoals = this.selectGoals.filter((goal)=>{
            if(goal.plan_id._id === this.planId){
              return goal.parent_goal_id.length === 1
            }
          })
        }
      } else {
        this.selectGoals = [];
      }

      // $("#table-select").dataTable().fnDestroy();
      // $("#table-select").dataTable();
      // // this.dataTableAfterViewInit();
    });
  }
  updateplanselect(e, goal_id) {
    console.log(this.updateplanselect.name)
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
  getDelegateGoals(planid, type) {
    console.log(this.getDelegateGoals.name)
    this.commonService.PostAPI(`goal/getgoals/bydelegate`, { id: planid, module_type: type }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.delegateGoals = response.data;
        console.log(this.delegateGoals)
        if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
          this.delegateGoals = this.delegateGoals.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
        }
        else {
          this.delegateGoals = this.delegateGoals.filter((goal)=>{
            if(goal.plan_id === this.planId){
              return goal.parent_goal_id.length === 1
            }
          })
        }
      } else {
        this.delegateGoals = [];
      }

      this.dtTriggerDelegate.next();
      this.dataTableAfterViewInit();
    });
  }
  get df() { return this.DelegateForm.controls; }


  goaldelegate(id, name) {
    console.log(this.goaldelegate.name)
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
    console.log(this.SaveDelegate.name)
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
    console.log(this.getalldelegategoals.name)
    this.commonService.PostAPI(`delegation/get/user/goals`, { child_user_id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.delegatedGoals = response.data;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  changegoaldelegatestatus(id, status) {
    console.log(this.changegoaldelegatestatus.name)
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
  getCountdownGoals(planid, type) {
    console.log(this.getCountdownGoals.name)
    this.commonService.PostAPI(`goal/getgoals/bycountdown`, { id: planid, module_type: type }).then((response: any) => {
      if (response.status) {
        this.countdownGoals = response.data;
        this.countdownGoals.forEach((element1, index) => {
          var finalhours = 0;
          var finalminutes = 0;
          if (element1.countdown) {
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
        if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
          this.countdownGoals = this.countdownGoals.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
        }
        else {
          this.countdownGoals = this.countdownGoals.filter((goal)=>{
            if(goal.plan_id === this.planId){
              return goal.parent_goal_id.length === 1
            }
          })
        }
        this.dividearrayintothreepart = 1

      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

// Launch
  getLaunchGoals(planid, type) {
    console.log(this.getLaunchGoals.name)
    this.commonService.PostAPI(`goal/getgoals/bycountdown`, { id: planid, module_type: type }).then((response: any) => {
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

        if(!this.parentIsActiveSelection && this.selectedChildGoalDetails.length !== 0){
          this.launchGoals = this.launchGoals.filter((goal)=>{return goal.parent_goal_id[goal.parent_goal_id.length - 1] === this.selectedChildGoalDetails._id})
        }
        else {
          this.launchGoals = this.launchGoals.filter((goal)=>{
            if(goal.plan_id === this.planId){
              return goal.parent_goal_id.length === 1
            }
          })
        }
      } else {
        this.launchGoals = [];
      }

      // this.dtTriggerLaunch.next();
      this.tableId = 'table-launch';
      this.dataTableAfterViewInit();
    });
  }
  convertStringToInt(str){
    console.log(this.convertStringToInt.name)
    return Number(str);
}

// Report
  getReportGoals(planid) {
    console.log(this.getReportGoals.name)
    console.log(this.goals)
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
    console.log(this.warnConstruction.name)
    alert('Under construction, please check back later for updates!')
  }
  showreportform(childGoalId, reportid, data) {
    console.log(this.showreportform.name)
    this.reportGoalId = childGoalId
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
    console.log(this.SaveReport.name)
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
    this.chartIsLoaded = false;
    this.chartRendered = false;
    this.initMeasureCharts(true)
  }


  resetReportSearch() {
    console.log(this.resetReportSearch.name)
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getReportGoals(this.planId);
  }

// Measure
  getPlanGoalDetails() {
    console.log(this.getPlanGoalDetails.name)
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
    console.log(this.onChangeDate.name)
    this.getPlanGoalDetails();
  }

  // Start Modules Functionality
  selectModule(type: any) {
    console.log(this.selectModule.name)
      if(this.parentIsActiveSelection || this.selectedChildGoalDetails && !this.parentIsActiveSelection){
        this.moduleItemActive = false;
        this.isSelectedChallange = false;
        this.ModuleForm.reset()
        this.ModuleFormSub.reset()
        console.log(this.planId)
        if (this.planId || this.childGoalId) {
          this.selectedModules = type;
          this.moduleType = type;
          this.showSelectedTree(type)
          this.getModules();
          this.ref.detectChanges();

          $('#module-start-date').datepicker({
            dateFormat: "mm-dd-yy",
            setDate: new Date(),
            todayHighlight: true,
          });
          $('#module-end-date').datepicker({
            setDate: new Date(),
            todayHighlight: true,
          });

          $('#module-start-date').datepicker().on('changeDate', function (e) {
            $('#module-start-date').datepicker('hide');
          });

          $('#module-end-date').datepicker().on('changeDate', function (e) {
            $('#module-end-date').datepicker('hide');
          });

          this.selectPhase(this.selectedPhase);
          if(type !== 'problem' && type !== 'opportunity'){
            this.getPlanGoals(this.planId, type);
          }
        } else {
          this.toastr.error("Something went wrong...", "Error")
        }
      }
      else {
        this.toastr.error("Please select plan item before using modules.", "Error")
      }

  }
  selectChallenge(type: any) {
    console.log(this.selectChallenge.name)
    if (this.selectedPhase !== 'B') {
      return this.toastr.error("Must be under brainstorm phase to use modules.")
    }
    else {
      if(this.parentIsActiveSelection || this.selectedChildGoalDetails && !this.parentIsActiveSelection){
        this.moduleItemActive = false;
        this.ModuleFormChallenge.reset()
        if (this.planId || this.childGoalId) {
          this.getChallengeTreeDetails(type)
          this.selectedChallenge = type;
          this.ref.detectChanges();

          $('#module-start-date-challenge').datepicker({
            dateFormat: "mm-dd-yy",
            setDate: new Date(),
            todayHighlight: true,
            startDate: new Date(this.selectedParentPlanDetails[0].start_date),
          });
          $('#module-end-date-challenge').datepicker({
            setDate: new Date(),
            todayHighlight: true,
            startDate: new Date(this.selectedParentPlanDetails[0].start_date),
          });

          $('#module-start-date-challenge').datepicker().on('changeDate', function (e) {
            $('#module-start-date-challenge').datepicker('hide');
          });

          $('#module-end-date-challenge').datepicker().on('changeDate', function (e) {
            $('#module-end-date-challenge').datepicker('hide');
          });

        } else {
          this.toastr.error("Something went wrong...", "Error")
        }
      }
      else {
        this.toastr.error("Please select plan item before using modules.", "Error")
      }
    }
  }


// Modules
  get mf() { return this.ModuleForm.controls; }
  resetModule() {
    console.log(this.resetModule.name)
    this.isModuleFormSubmitted = false;
    this.ModuleForm.reset();
  }
  saveModule() {
    console.log(this.saveModule.name)
    this.isModuleFormSubmitted = true;
    if (this.ModuleForm.invalid && !this.challengeSelected) {
      return;
    } else {
      if(this.challengeSelected){
        var startDate: any = $("#module-start-date-challenge").val();
        var endDate: any = $("#module-end-date-challenge").val();
      }
      else {
        var startDate: any = $("#module-start-date").val();
        var endDate: any = $("#module-end-date").val();
      }


      if (startDate != '' && endDate != '') {
        if (new Date(startDate) > new Date(endDate)) {
          this.toastr.error("Start date must be smaller than end date.", "Error");
        } else {
          var data;
          if(this.challengeSelected && (this.selectedChallenge === 'problem' || this.selectedChallenge === 'opportunity')){
            data = this.ModuleFormChallenge.value
            data.module_type = this.selectedChallenge;
          }
          else {
            data = this.ModuleForm.value
            data.module_type = this.selectedModules;
          }

            data.plan_id = this.selectedChildGoalDetails._id ? this.selectedChildGoalDetails._id : this.selectedParentPlanDetails[0]._id
            data.user_id = this.currentuser.user._id
            data.status = 0;
            data.numbers = 0;
            data.start_date = startDate;
            data.end_date = endDate;

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
                if(!this.challengeSelected){
                  this.showSelectedTree(this.selectedModules);
                  this.isModuleFormSubmitted = false;
                  this.ModuleForm.reset();
                }
                else {
                  this.ModuleFormChallenge.reset();
                }
              } else {
                this.toastr.error(response.message, "Error");
              }
            });
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

  // Module tree and related individual functions
  getSelectedModule(id){
    console.log(this.getSelectedModule.name)
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
    console.log(this.saveModuleSub.name)
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

            if(this.challengeItemSelected){
              data.module_type = this.selectedChallenge;
            }
            else {
              data.module_type = this.selectedModules;
            }

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
                this.getPlanDetails()
                this.isModuleFormSubmitted = false;
                if(this.challengeItemSelected){
                  this.getChallengeTreeDetails(this.selectedChallenge)
                }
                else {
                  this.getModuleTreeDetails(this.selectedModules)
                }
              } else {
                this.toastr.error(response.message, "Error");
              }
            })
            this.ModuleFormSub.reset()
        }
    }
  getModuleTreeDetails(type) {
    console.log(this.getModuleTreeDetails.name)
    var data: any = {};
    var a = this;
    data.plan_id = this.planId
    data.user_id = this.currentuser.user._id
    data.module_type = type;
    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      var treeArray: any = [];
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        response.data.filter((element)=>{
          if(this.parentIsActiveSelection || this.moduleItemActive || this.challengeItemSelected){
            return element.plan_id === this.planId
          }
          else {
            return element.plan_id === this.selectedChildGoalDetails._id
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
            a.getSelectedChildGoalDetails(data.selected[0], data.node.parent);
            a.getSelectedModule(data.selected[0])
            a.getGoalReportByPlan(data.node.parent);
            a.resetUIVarsModule(type)
            a.getModules()
            a.getGoalAttachments(data.selected[0]);
            a.getGoalSharedUsers(data.selected[0]);

            $('#jstree-challenge-tree').jstree("deselect_all")

            if(a.selectedPhase !== 'B'){
              a.selectPhase(a.selectedPhase)
            }
           }
        );
        $('#jstree-module-tree').jstree({ core: { data: treeArray } });
    });
  }

  resetUIVarsModule(type: String){
    console.log(this.resetUIVarsModule.name)
    this.parentIsActiveSelection = false;
    this.moduleItemActive = true;
    this.challengeItemSelected = false;
    this.editChildEnabled = false
    this.selectedModules = type
  }

  // Challenge and Challenge Module trees inc. their individual item functions below
  getChallengeTreeDetails(type) {
    console.log(this.getChallengeTreeDetails.name)
    var data: any = {};
    var a = this;
    data.plan_id = a.planId
    data.user_id = this.currentuser.user._id
    data.module_type = type;
    a.selectedChallenge = type;
    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      var treeArray: any = [];
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        response.data.filter((element)=>{
          if(this.parentIsActiveSelection || this.moduleItemActive || this.challengeItemSelected){
            return element.plan_id === this.planId
          }
          else {
            return element.plan_id === this.selectedChildGoalDetails._id
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
        $('#jstree-challenge-tree').jstree("destroy");
        $("#jstree-challenge-tree").on("select_node.jstree",
          function (evt, data) {
            a.editChildEnabled = false
            a.getSelectedChildGoalDetails(data.selected[0], data.node.parent);
            a.getSelectedModule(data.selected[0])
            a.getGoalReportByPlan(data.node.parent);
            a.parentIsActiveSelection = false;
            a.getGoalAttachments(data.selected[0]);
            a.getGoalSharedUsers(data.selected[0]);
            a.moduleItemActive = false;
            a.selectedModules = ''
            a.selectedChallenge = a.challengeView
            a.challengeItemSelected = true;
            a.getChallenges()
            a.getChallengeModuleTreeDetails('strategy')
            $('#jstree-module-tree').jstree("deselect_all")
            if(a.selectedPhase !== 'B'){
              a.selectPhase(a.selectedPhase)
            }
           }
        );

        $('#jstree-challenge-tree').jstree({ core: { data: treeArray } });

    });
  }
  getChallengeModuleTreeDetails(type) {
    console.log(this.getChallengeModuleTreeDetails.name)
    console.log(type)
    var data: any = {};
    var a = this;
    data.plan_id = a.selectedChildGoalDetails._id;
    data.user_id = this.currentuser.user._id
    data.module_type = type;
    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      var treeArray: any = [];
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        response.data.forEach(element => {
            if (element.parent_goal_id !== ''){
              treeArray.push({ "id": element._id, "parent": element.parent_goal_id, "text": element.short_name, 'state': { 'opened': false }, "icon": "assets/images/avatars/M.png" });
            }
            else {
            treeArray.push({ "id": element._id, "parent": "#", "text": element.short_name, 'state': { 'opened': false }, "icon": "assets/images/avatars/M.png" });
            }
        });
      }

        $('#jstree-challenge-module-tree').jstree("destroy");
        $("#jstree-challenge-module-tree").on("select_node.jstree",
          function (evt, data) {
            a.editChildEnabled = false
            a.getSelectedChildGoalDetails(data.selected[0], data.node.parent);
            a.getSelectedModule(data.selected[0])
            a.getGoalReportByPlan(data.node.parent);
            a.parentIsActiveSelection = false;
            a.getGoalAttachments(data.selected[0]);
            a.getGoalSharedUsers(data.selected[0]);
            if(a.selectedPhase !== 'B'){
              a.selectPhase(a.selectedPhase)
            }
           }
        );

        $('#jstree-challenge-module-tree').jstree({ core: { data: treeArray } });

    });
  }
  getModules() {
    console.log(this.getModules.name)
    var data: any = {};

    data.plan_id = this.selectedChildGoalDetails._id ? this.selectedChildGoalDetails._id : this.planId
    data.user_id = this.currentuser.user._id
    data.module_type = this.selectedModules;

    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        this.moduleGoals = response.data;
      } else {
        this.moduleGoals = [];
      }

      // NEED TO SET TABLE IDS BASED ON TABLE DISPLAYING
      if(this.selectedModules === 'task'){
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
  getChallenges() {
    console.log(this.getChallenges.name)
    var data: any = {};

    data.plan_id = this.selectedChildGoalDetails._id ? this.selectedChildGoalDetails._id : this.planId
    data.user_id = this.currentuser.user._id
    data.module_type = this.selectedChallenge;

    this.commonService.PostAPI(`module/get-by-user-and-plan`, data).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityDetails = response.data;
        this.moduleGoals = response.data;
      } else {
        this.moduleGoals = [];
      }

      // this.dtTriggerModule.next();
      if(this.selectedModules === 'task'){
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
    console.log(this.uploadAttachment.name)
    this.moduleAttachments = event;
  }

// Related to the plan form and additional fields
  getplanform() {
    console.log(this.getplanform.name)
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
              this.parentPlanForm.addControl(element.name, new FormControl(['', Validators.required]))
            } else {
              this.parentPlanForm.addControl(element.name, new FormControl(['']))
            }
          });

          // Need to check for edit
          if (this.editid != undefined) {

            // Date pipe might get deprecated
            var datePipe = new DatePipe("en-US");
            this.final.forEach(element => {
              Object.keys(element).forEach(key => {
                if (this.planDetails[element.name] == undefined) {
                  this.planDetails[element.name] = ''
                }
                this.parentPlanForm.patchValue({
                  [element.name]: this.planDetails[element.name]
                })
              })
            })

            // Rendering the form
            this.parentPlanForm.patchValue({
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
    console.log(this.addcontrol.name)

    /**
     * Add form control for (+ button)add new field in plan form
     */
    let data = [];
    var test = $("#data" + i).val();
    data[0][test] = [''];
    this.parentPlanForm = this.formBuilder.group(data[0]);

  }
  get jval() {
    return this.parentPlanForm.controls;
  }
  openAdditionalFieldsModal() {
    $("#fromControlModal").modal("show");
  }
  removeoption(i) {
    console.log(this.removeoption.name)
    var index = $("#controlid").val();
    this.formfield[index]['option'] = this.selectoption;
    //$("#myModal2").modal("hide");
    delete this.formfield[index]['option'][i]

    this.formfield[index]['option'].splice(i, 1)
  }
  onAddData() {

  }
  onAddoption() {
    console.log(this.onAddoption.name)
    this.selectoption.push({ id: '' })
  }
  onplanformcreate() {
    console.log(this.onplanformcreate.name)
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
          this.parentPlanForm.addControl(element.name, new FormControl(['', Validators.required]))
        } else {
          this.parentPlanForm.addControl(element.name, new FormControl(['']))
        }
      });

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
    console.log(this.removeData.name)
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

// Allows visiting parent item from child
  visitParentForm(plan_id){
    console.log(this.visitParentForm.name)
    this.getPlanDetails()
    this.getPlanDetailMain(plan_id);
    this.getGoalReportByPlan(plan_id);
    plan_id = plan_id;
    this.parentIsActiveSelection = true;
    $('#project-item-tree').jstree(true).redraw()
  }
  getselectoption(option, i) {
    console.log(this.getselectoption.name)
    if (option == "select") {
      this.showcustomtag = true;
      this.formfield[i]["option"] = [];
    } else {
      var key = "option";
      delete this.formfield[i][key]
    }
  }
  addoption(i) {
    console.log(this.addoption.name)
    this.selectoption = this.formfield[i]['option'];
    $("#myModal2").modal("show");
    $("#controlid").val(i)
  }
  saveoption() {
    console.log(this.saveoption.name)
    var index = $("#controlid").val();
    this.formfield[index]['option'] = this.selectoption;
    $("#myModal2").modal("hide");
  }
  /**
    * plan form save
  **/
  submitParentPlanForm() {
    console.log(this.submitParentPlanForm.name)
    this.parentPlanForm.get('start_date').setValue($('#date-input5').val())
    this.parentPlanForm.get('end_date').setValue($('#date-input6').val())
    this.IsLoginFormValid = true;
    if (this.parentPlanForm.invalid) {
      return;
    } else {
      if ($('#date-input5').val() != '' && $('#date-input6').val() != '') {
        if (new Date($('#date-input5').val()) > new Date($('#date-input6').val())) {
          this.toastr.error("Your start date is greater than End Date", "Error");
        } else {
          var data = this.parentPlanForm.value;
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
              this.parentPlanForm.reset();

              this.getPlanDetails();

              this.selectedPhase = 'project';
            } else {
              this.toastr.error(response.message, "Error");
            }
          });
          this.resetParentPlanForm()
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
  resetParentPlanForm() {
    console.log(this.resetParentPlanForm.name)
    this.IsLoginFormValid = false;
    this.parentPlanForm.reset();
    this.parentPlanForm.get('security').setValue('0');
    this.parentPlanForm.get('production_type').setValue('');
  }
  onChangePlan(e) {
    console.log(this.onChangePlan.name)
    this.selectedSharedPlanUser = e;
  }

  getCoachesCornerDetails() {
    console.log(this.getCoachesCornerDetails.name)
    this.commonService.PostAPI(`coach/get/all`, {}).then((response: any) => {
      if (response.status) {
        this.coachesDetails = response.data;
      } else {
        this.coachesDetails = [];
      }
    });
  }


// Discussion
  get dscf() {
    return this.DiscussionForm.controls;

  }
  resetDiscussionForm() {
    console.log(this.resetDiscussionForm.name)
    this.isSubmittedDiscussionForm = false;
    this.DiscussionForm.reset();
  }
  onSubmitDiscussion() {
    console.log(this.onSubmitDiscussion.name)
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
    console.log(this.uploadDiscussionAttachment.name)
    this.discussionAttachments = event;
  }

  showSelectedTree(type) {
    console.log(this.showSelectedTree.name)
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
