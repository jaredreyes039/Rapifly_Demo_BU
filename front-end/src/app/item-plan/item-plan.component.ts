import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from "src/app/services/common.service";
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'
import { DataTableDirective } from 'angular-datatables';
import { ChatService } from '../services/chat.service';
import * as moment from 'moment';
import { element } from 'protractor';

declare var $: any;

@Component({
  selector: 'app-item-plan',
  templateUrl: './item-plan.component.html',
  styleUrls: ['./item-plan.component.css']
})

export class ItemPlanComponent implements OnInit {

  public get_data_json: any;

  // Data-table
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  public plans: any;

  parentplangroup: FormGroup;
  editparentplangroup: FormGroup;
  sendMessageForm: FormGroup;
  isSendMessageFormValid: boolean = false;
  sendGoalMessageForm: FormGroup;
  isSendGoalMessageFormValid: boolean = false;
  sendStrategyMessageForm: FormGroup;
  isSendStrategyMessageFormValid: boolean = false;
  sendChallangeMessageForm: FormGroup;
  isSendChallangeMessageFormValid: boolean = false;
  changeForm: FormGroup;
  isChangeFormFormValid: boolean = false;

  goalForm: any = FormGroup;
  isGoalFormSubmitted: boolean = false;

  IsLoginFormValid = false;
  IsEditPlanFormValid = false;

  currentuser;
  currentUserId: any;
  parent_user_id: any;

  editedplan: any = [];
  // plans: any = [];

  sharedPlanDetails: any;
  userGroups: any = [];
  selectedUserGroups: any = [];

  users = [];
  selected = [];

  can_share_plan: boolean = false;
  can_access_goal: boolean = false;

  attachments: File[] = [];
  planAttachments: [];

  isOpenImageModal: boolean = false;
  imageUrl: any = '';
  delete_plan_attachment_id: any;
  userPlanChats: any = [];

  userMessage: any;
  chatAttachment: any = [];

  goalDetails: any = [];
  strategiesDetails: any = [];
  selectedGoal: any;
  goalAttachments: any = [];
  attachGoalAttachments: any = [];
  attachStrategyAttachments: any = [];
  goalChatAttachment: any = [];
  userGoalChats: any = [];
  childGoals: any = [];
  goalAndChildGoals: any = [];

  isOpenPlanModal: Boolean = false;
  isOpenModal: boolean = false;
  isOpenGoalModal: boolean = false;
  isOpenStrategyModal: boolean = false;

  chat_attachment_name: any = '';
  chat_attachment_url: any = '';

  // Form Controls variables
  formField: any = [];

  // Strategy
  selectedStrategy: any;
  strategyAttachments: any = [];
  strategyChatAttachment: any = [];
  userStrategyChats: any = [];

  // Change management
  opportunityProblems: any = [];

  // Challange Management
  isOpenChallangeManagementModal: boolean = false;
  challangeDetails: any;
  attachChallangeAttachments: any = [];
  challangeAttachments: any = [];
  challangeChatAttachment: any = [];
  userChallangeChats: any = [];

  actionPlanId: any;

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
    private chatService: ChatService,
    private ref: ChangeDetectorRef
  ) {
    this.currentuser = this.authenticationService.currentUserValue;
    this.currentUserId = this.currentuser.user._id;
    this.parent_user_id = this.currentuser.user.parent_user_id;

    this.formField = [{ name: '', type: '', required: '', label: '', value: '', userid: this.currentUserId }];

    this.actionPlanId = this.route.snapshot.params['id'];
  }

  selectoption = [{ id: '' }];
  data: any = [{}];
  showCustomTag = false;
  goalControls: any = [];

  planItemType: any;
  planItemModalTitle: any;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.dtTrigger.next()
    this.parentplangroup = this.formBuilder.group({
      numbers: ['', Validators.required],
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: [''],
      start_date: [''],
      end_date: [''],
      security: ['', Validators.required]
    });

    this.editparentplangroup = this.formBuilder.group({
      numbers: ['', Validators.required],
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      description: [''],
      start_date: [''],
      end_date: [''],
      security: ['', Validators.required]
    });

    this.sendMessageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });

    this.sendGoalMessageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });

    this.sendStrategyMessageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });

    this.sendChallangeMessageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });

    this.changeForm = this.formBuilder.group({
      challange: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.data[0]["short_name"] = ['', Validators.required];
    this.data[0]["long_name"] = ['', Validators.required];
    this.data[0]["expected_target"] = ['', Validators.required];
    this.data[0]["revenue_target"] = ['', Validators.required];
    this.data[0]["description"] = [''];
    this.data[0]["start_date"] = [''];
    this.data[0]["end_date"] = [''];
    this.goalForm = this.formBuilder.group(this.data[0]);

    this.getallplan();

    // Plan
    this.chatService.getMessages().subscribe((response: any) => {
      if (this.sharedPlanDetails && this.sharedPlanDetails._id == response.plan_id) {
        var plan_chat_id = response._id;

        this.commonService.PostAPI('plan/get/single/chat', { _id: plan_chat_id }).then((response: any) => {
          if (response.status && response.data) {
            this.userPlanChats.push(response.data);
            this.ref.detectChanges(); //This function will detect change in array and send it to html side.
            setTimeout(() => {
              var container = document.getElementById("plan-chat-attachment-div");
              container.scrollTop = container.scrollHeight;
              container.scrollIntoView({ block: 'end' });
            }, 600);
          }
        });
      }
    });

    // Goal
    this.chatService.getGoalMessages().subscribe((response: any) => {
      if (this.selectedGoal && this.selectedGoal._id == response.goal_id) {
        var goal_chat_id = response._id;

        this.commonService.PostAPI(`${this.slug}goal/get/single/chat`, { _id: goal_chat_id }).then((response: any) => {
          if (response.status && response.data) {
            this.userGoalChats.push(response.data);
            this.ref.detectChanges(); //This function will detect change in array and send it to html side.
            setTimeout(() => {
              var container = document.getElementById("goal-chat-attachment-div");
              container.scrollTop = container.scrollHeight;
              container.scrollIntoView({ block: 'end' });
            }, 600);
          }
        });
      }
    });

    // Strategy
    this.chatService.getStrategyMessages().subscribe((response: any) => {
      if (this.selectedStrategy && this.selectedStrategy._id == response.strategy_id) {
        var chat_id = response._id;

        this.commonService.PostAPI(`${this.slug}goal/strategy/get/single/chat`, { _id: chat_id }).then((response: any) => {
          if (response.status && response.data) {
            this.userStrategyChats.push(response.data);
            this.ref.detectChanges(); //This function will detect change in array and send it to html side.
            setTimeout(() => {
              var container = document.getElementById("strategy-chat-attachment-div");
              container.scrollTop = container.scrollHeight;
              container.scrollIntoView({ block: 'end' });
            }, 600);
          }
        });
      }
    });

    // Challange
    this.chatService.getChallangeMessages().subscribe((response: any) => {
      if (this.challangeDetails && this.challangeDetails._id == response.challange_id) {
        var chat_id = response._id;

        this.commonService.PostAPI(`${this.slug}plan/challange/get/single/chat`, { _id: chat_id }).then((response: any) => {
          if (response.status && response.data) {
            this.userChallangeChats.push(response.data);
            this.ref.detectChanges(); //This function will detect change in array and send it to html side.
            setTimeout(() => {
              var container = document.getElementById("challange-chat-attachment-div");
              container.scrollTop = container.scrollHeight;
              container.scrollIntoView({ block: 'end' });
            }, 600);
          }
        });
      }
    });

    // Datepicker
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

    if (this.actionPlanId && this.actionPlanId != '') {
      this.openPlanShareModal({ _id: this.actionPlanId });
    }
  }

  get jval() {
    return this.parentplangroup.controls;
  }

  get editplan() {
    return this.editparentplangroup.controls;
  }

  get change() {
    return this.changeForm.controls;
  }

  // convenience getter for easy access to form fields
  get f() { return this.goalForm.controls; }

  submit(form) {
    this.IsLoginFormValid = true;
    // this.IsLoginFormValid = true;
    if (this.parentplangroup.invalid) {
      return;
    } else {
      //$("#datepicker").datepicker("setDate", new Date);
      var data = this.parentplangroup.value;
      data.user_id = this.currentuser.user._id,
        data.status = 0;
      data.plan_id = 1;
      // data.created_at = new Date()
      data.start_date = $('#date-input1').val();
      data.end_date = $('#date-input2').val()
      this.commonService.PostAPI(`${this.slug}plan/create/parent`, data).then((response: any) => {
        if (response.status) {
          $("#myModal").modal('hide');
          this.toastr.success(response.message, "Success");

          this.getallplan2()
          this.resetSearch();
        } else {
          this.toastr.error(response.message, "Error");
          // this.is_disabled = false;
        }
      });
    }
  }

  getallplan() {
    this.commonService.GetAPI(`${this.slug}plan/get/allplan`, { id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.plans = response.data;
        this.dtTrigger.next();
        // this.dataTableAfterViewInit();
      } else {
        this.toastr.error(response.message, "Error");
        // this.is_disabled = false;
      }
    });
  }

  getallplan2() {

    this.commonService.GetAPI(`${this.slug}plan/get/allplan`, { id: this.currentuser.user._id }).then((response: any) => {
      if (response.status) {
        this.plans = response.data;
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  reset() {
    this.IsLoginFormValid = false;
    this.parentplangroup.reset();
    this.parentplangroup.get('security').setValue(' ');

    $("#myModal").modal('show');
  }
  dataTableAfterViewInit() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
        $('input', this.footer()).on('keyup change', function () {
          if (that.search() !== this['value']) {
            that
              .search(this['value'])
              .draw();
          }
        });
      });
    });
  }
  updateplanStatus(e, plan_id) {
    var status: number;

    if (e.target.checked) {
      status = 0;
    } else {
      status = 1;
    }

    this.commonService.PostAPI(`${this.slug}plan/update/status`, {
      status: status,
      id: plan_id
    }).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  resetSearch() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
    });
    this.getallplan();
  }
  openEditModal(plan) {
    this.editedplan = plan;
    var datePipe = new DatePipe("en-US");

    $('#date-input3').datepicker('setDate', datePipe.transform(plan.start_date, 'MM/dd/yyyy'));
    $('#date-input4').datepicker('setDate', datePipe.transform(plan.end_date, 'MM/dd/yyyy'));
    this.editparentplangroup.setValue({
      numbers: plan.numbers,
      short_name: plan.short_name,
      long_name: plan.long_name,
      description: plan.description,
      start_date: datePipe.transform(plan.start_date, 'MM/dd/yyyy'),
      end_date: datePipe.transform(plan.end_date, 'MM/dd/yyyy'),
      security: plan.security,
    });
    $("#editplanModal").modal('show');
  }
  onSubmitUpdate() {
    this.IsEditPlanFormValid = true;
    if (this.editparentplangroup.invalid) {
      return;
    } else {
      var data = this.editparentplangroup.value;
      data.id = this.editedplan._id;
      data.start_date = $('#date-input3').val();
      data.end_date = $('#date-input4').val()
      this.commonService.PostAPI(`${this.slug}plan/update`, data).then((response: any) => {
        if (response.status) {
          $("#editplanModal").modal('hide');
          this.toastr.success(response.message, "Success");
          this.getallplan2()
          this.resetSearch();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  //On click to plan's short name, modal open. get all details of plan, selected user group and selected users.
  openPlanShareModal(planDetails) {
    this.selectedGoal = '';
    this.selectedStrategy = '';

    this.commonService.PostAPI(`${this.slug}plan/get`, { id: planDetails._id }).then((response: any) => {
      if (response.status && response.data) {
        this.sharedPlanDetails = response.data;

        if (response.data.selected_user_group && response.data.selected_user_group.length > 0) {
          this.selectedUserGroups = response.data.selected_user_group;
        } else {
          this.selectedUserGroups = [];
        }

        if (response.data.selected_users && response.data.selected_users.length > 0) {
          var usersArr = [];

          response.data.selected_users.forEach(element => {
            var data = {
              id: element.user_id._id,
              name: `${element.user_id.first_name} ${element.user_id.last_name}`
            };

            usersArr.push(data);
          });

          this.selected = usersArr;
        } else {
          this.selected = [];
        }

        this.getUserGroups();
        this.getHierarchyUsers();
        this.getPlanAttachment();
        this.getChatMessageDetails();
        this.getPlanGoals();
        this.getOpportunityAndProblem();

        if (this.currentUserId == this.sharedPlanDetails.user_id) {
          this.can_share_plan = true;
        } else {
          this.can_share_plan = false;
        }

        //Open modal
        this.isOpenModal = true;
        $('body').addClass('overflow-hidden');
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  //Get all user groups of current logged-in user
  getUserGroups() {
    this.commonService.PostAPI(`${this.slug}user_group/get/by/user`, { user_id: this.currentUserId }).then((response: any) => {
      if (response.status) {
        this.userGroups = response.data;
      } else {
        this.userGroups = [];
      }
    });
  }

  //On change and select user group
  onChangeUserGroups(e) {
    this.selectedUserGroups = e;
    this.updatePlan();
  }

  //On change and select multiple users
  onChangeUsers(e) {
    this.selected = e;
    this.updatePlan();
  }

  //Update plan
  updatePlan() {
    var selectedUsersFromGroup = [];
    var users_group_ids = [];

    var selectedUsers = [];
    var users = [];

    if (this.selectedUserGroups && this.selectedUserGroups.length > 0) {
      this.selectedUserGroups.map((element) => {
        if (element.group_members && element.group_members.length > 0) {
          element.group_members.map((data) => {
            selectedUsersFromGroup.push(data);
            users.push(data);
          });
        }

        users_group_ids.push(element._id)
      });
    }

    if (this.selected && this.selected.length > 0) {
      selectedUsers = this.selected.map(data => data.id);
      users = this.selected.map(data => data.id);
    }

    if ((selectedUsers && selectedUsers.length > 0 && selectedUsers != undefined) && (selectedUsersFromGroup && selectedUsersFromGroup.length > 0)) {
      //Merge array with filter unique user ids.
      users = selectedUsersFromGroup.concat(selectedUsers.filter((item) => selectedUsersFromGroup.indexOf(item) < 0));
    }

    var data = {
      id: this.sharedPlanDetails._id,
      users_group_id: users_group_ids,
      share_users: selectedUsers,
      shared_plan_to_users: users,
    };

    this.commonService.PostAPI(`${this.slug}plan/update/users/details`, data).then((response: any) => {
      if (response.status) {
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  //Get users that assigned by designations
  getHierarchyUsers() {
    this.commonService.PostAPI(`${this.slug}users/get/all`, { parent_user_id: this.parent_user_id, user_id: this.currentUserId }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.length > 0) {
          var usersArr = [];

          response.data.forEach(element => {
            var data = {
              id: element.user_id._id,
              name: `${element.user_id.first_name} ${element.user_id.last_name}`
            };

            usersArr.push(data);
          });

          this.users = usersArr;
        }
      } else {
        this.toastr.error(response.message, 'Error');
      }
    });
  }

  closePlanShareModal() {
    $("#planShareModal").modal("hide");
  }

  //Check condition, if current user and chat sender user
  checkCurrentUser(user_id) {
    if (this.currentUserId === user_id) {
      return true;
    } else {
      return false;
    }
  }

  //Change and modify Plan Description
  updatePlanDescription(e) {
    this.commonService.PostAPI(`${this.slug}plan/change/description`, { id: this.sharedPlanDetails._id, description: e.target.value }).then();
  }

  //Change and modify Plan Motivation
  updatePlanMotivation(e) {
    this.commonService.PostAPI(`${this.slug}plan/change/motivation`, { id: this.sharedPlanDetails._id, motivation: e.target.value }).then();
  }

  //Upload plan attachment
  uploadFile(event) {
    this.attachments = event;

    const formData: any = new FormData();
    const files: Array<File> = this.attachments;

    for (let i = 0; i < files.length; i++) {
      formData.append("attachments", files[i], files[i]['name']);
    }

    formData.append('plan_id', this.sharedPlanDetails._id);
    formData.append('user_id', this.currentUserId);

    this.commonService.PostAPI(`${this.slug}plan/store/attachments`, formData).then((response: any) => {
      if (response.status) {
        this.getPlanAttachment();
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "File Upload Error!");
      }
    });
  }

  getPlanAttachment() {
    var plan_id = this.sharedPlanDetails._id;

    this.commonService.PostAPI(`${this.slug}plan/get/attachments`, { plan_id: plan_id }).then((response: any) => {
      if (response.status) {
        if (response.data && response.data.length > 0) {
          this.planAttachments = response.data;
        } else {
          this.planAttachments = [];
        }
      } else {
        this.planAttachments = [];
      }
    });
  }

  removeAttachment(plan_attachment_id) {
    this.delete_plan_attachment_id = plan_attachment_id;
    $("#deleteAttachmentConfirm").modal('show');
  }

  confirmRemoveAttachment() {
    this.commonService.PostAPI(`${this.slug}plan/attachments/delete`, { plan_attachment_id: this.delete_plan_attachment_id }).then((response: any) => {
      if (response.status) {
        this.getPlanAttachment();
        $("#deleteAttachmentConfirm").modal('hide');
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
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

  openImage(image_url) {
    this.imageUrl = image_url;
    $("#viewImage").modal('show');
  }

  closeImageModal() {
    $("#viewImage").modal('hide');
    this.imageUrl = '';
  }

  //Send message in socket
  sendMessage() {
    var message: any = document.getElementById("plan-message");

    if ((message.value && message.value != '') || (this.chatAttachment && this.chatAttachment.length > 0)) {
      var data: any = {};
      data.message = message.value;
      data.sender_id = this.currentUserId;
      data.plan_id = this.sharedPlanDetails._id;

      if (this.chatAttachment && this.chatAttachment.length > 0) {
        var nameArr = [];
        var attachments = [];

        for (let index = 0; index < this.chatAttachment.length; index++) {
          const element = this.chatAttachment[index];
          nameArr.push(element.name)
          attachments.push(element)
        }

        data.attachment_name = nameArr;
        data.attachments = attachments;
      }

      this.chatService.sendMessage(data);
      var element: any = document.getElementById("plan-message")
      element.value = '';

      this.chatAttachment = [];
    }
  }

  //Get chat message details plan wise
  getChatMessageDetails() {
    this.commonService.PostAPI(`${this.slug}plan/get/chat`, { plan_id: this.sharedPlanDetails._id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.userPlanChats = response.data;

        setTimeout(() => {
          var container = document.getElementById("plan-chat-attachment-div");
          container.scrollTop = container.scrollHeight;
          container.scrollIntoView({ block: 'end' });
        }, 600);
      } else {
        this.userPlanChats = [];
      }
    });
  }

  checkUserMessage() {
    if (this.userMessage && this.userMessage != '') {
      return true;
    } else {
      return false;
    }
  }

  // Send an attachment in chat
  sendAttachment(event) {
    var files: any = [];

    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      files.push(element);
    }

    this.chatAttachment = files;
  }

  //Delete plan chat uploaded attachments
  deleteAttachment(index) {
    var fileKey: any = parseInt(index);
    var files: File[] = [];

    if (this.chatAttachment && this.chatAttachment.length > 0) {
      for (const key in this.chatAttachment) {
        if (this.chatAttachment.hasOwnProperty(key)) {
          if (key != fileKey) {
            const element = this.chatAttachment[key];
            files.push(element);
          }
        }
      }
    } else {
      files = [];
    }

    this.chatAttachment = files;
  }

  //Delete goal chat uploaded attachment
  deleteGoalUploadedAttachment(index) {
    var fileKey: any = parseInt(index);
    var files: File[] = [];

    if (this.goalChatAttachment && this.goalChatAttachment.length > 0) {
      for (const key in this.goalChatAttachment) {
        if (this.goalChatAttachment.hasOwnProperty(key)) {
          if (key != fileKey) {
            const element = this.goalChatAttachment[key];
            files.push(element);
          }
        }
      }
    } else {
      files = [];
    }

    this.goalChatAttachment = files;
  }

  getShortName(name) {
    var matches = name.match(/\b(\w)/g);
    return matches.join('');
  }

  getPlanGoals() {
    var plan_id = this.sharedPlanDetails._id;

    this.commonService.PostAPI(`${this.slug}goal/get/by/plan`, { plan_id: plan_id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.goalDetails = response.data;
      } else {
        this.goalDetails = [];
      }
    });

    this.commonService.PostAPI(`${this.slug}goal/get/strategies`, { plan_id: plan_id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.strategiesDetails = response.data;
      } else {
        this.strategiesDetails = [];
      }
    });
  }

  // Goal modal
  openGoalModal(data, planDetails) {

    // Store parent goals detail for show it in naviagtion in goal modal.
    var goalData: any = {
      id: data._id,
      name: data.short_name
    };

    //Push in global variable
    this.goalAndChildGoals.push(goalData);

    this.selectedGoal = data;
    this.sharedPlanDetails = planDetails;

    this.getChildGoals(this.selectedGoal._id);
    this.getGoalAttachments(this.selectedGoal._id);
    this.getGoalChatMessageDetails();

    if (this.currentUserId == this.sharedPlanDetails.user_id) {
      this.can_access_goal = true;
    } else {
      this.can_access_goal = false;
    }

    //Open Modal
    this.isOpenGoalModal = true;
    $('body').addClass('overflow-hidden');
  }

  // Change goal modal
  changeGoalModal(goal, index) {

    var goalNavArr: any = [];

    this.goalAndChildGoals.forEach((element, key) => {
      if (index >= key) {
        goalNavArr.push(element);
      }
    });

    this.goalAndChildGoals = goalNavArr;

    this.commonService.PostAPI(`${this.slug}goal/get/by/id`, { goal_id: goal.id }).then((response: any) => {
      if (response.status && response.data) {
        // Close goal modal
        this.isOpenGoalModal = false;

        // Set selected goal
        this.selectedGoal = response.data;

        this.getChildGoals(this.selectedGoal._id);
        this.getGoalAttachments(this.selectedGoal._id);
        this.getGoalChatMessageDetails();

        if (this.currentUserId == this.sharedPlanDetails.user_id) {
          this.can_access_goal = true;
        } else {
          this.can_access_goal = false;
        }

        //Open goal modal again :)
        this.isOpenGoalModal = true;
      } else {
        this.toastr.error("Something went wrong.", "Error")
      }
    });
  }

  uploadGoalAttachment(event) {
    this.attachGoalAttachments = event;

    const formData: any = new FormData();
    const files: Array<File> = this.attachGoalAttachments;

    for (let i = 0; i < files.length; i++) {
      formData.append("attachments", files[i], files[i]['name']);
    }

    formData.append('goal_id', this.selectedGoal._id);

    this.commonService.PostAPI(`${this.slug}goal/store/attachments`, formData).then((response: any) => {
      if (response.status) {
        this.getGoalAttachments(this.selectedGoal._id);
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "File Upload Error!");
      }
    });
  }

  //Get Goal Attachments
  getGoalAttachments(goal_id) {
    this.commonService.PostAPI(`${this.slug}goal/get/attachments`, { goal_id: goal_id }).then((response: any) => {
      if (response.status) {
        this.goalAttachments = response.data;
      } else {
        this.goalAttachments = []
      }
    });
  }

  //Delete goal attachment
  deleteGoalAttachment(goal_attachment_id, goal_id) {
    this.commonService.PostAPI(`${this.slug}goal/attachments/delete`, { goal_attachment_id: goal_attachment_id }).then((response: any) => {
      if (response.status) {
        this.getGoalAttachments(goal_id)
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  // Send an attachment in chat
  sendGoalAttachment(event) {
    this.goalChatAttachment = event;
  }

  //Send message in socket
  sendGoalMessage() {
    if ((this.sendGoalMessageForm.value.message && this.sendGoalMessageForm.value.message != '') || (this.goalChatAttachment && this.goalChatAttachment.length > 0)) {
      var data = this.sendGoalMessageForm.value;
      data.sender_id = this.currentUserId;
      data.goal_id = this.selectedGoal._id;

      if (this.goalChatAttachment && this.goalChatAttachment.length > 0) {
        var nameArr = [];
        var attachments = [];

        for (let index = 0; index < this.goalChatAttachment.length; index++) {
          const element = this.goalChatAttachment[index];
          nameArr.push(element.name)
          attachments.push(element)
        }

        data.attachment_name = nameArr;
        data.attachments = attachments;
      }

      this.chatService.sendGoalMessage(data);
      this.sendGoalMessageForm.reset();
      this.goalChatAttachment = [];
    }
  }

  //Get chat message details plan wise
  getGoalChatMessageDetails() {
    this.commonService.PostAPI(`${this.slug}goal/get/chat`, { goal_id: this.selectedGoal._id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.userGoalChats = response.data;

        setTimeout(() => {
          var container = document.getElementById("goal-chat-attachment-div");
          container.scrollTop = container.scrollHeight;
          container.scrollIntoView({ block: 'end' });
        }, 600);
      } else {
        this.userGoalChats = [];
      }
    });
  }

  closeModal() {
    this.isOpenModal = false;
    $('body').removeClass('overflow-hidden');
  }

  closeGoalModal() {
    this.isOpenGoalModal = false;
    this.selectedGoal = '';
    this.selectedStrategy = '';
    this.goalAndChildGoals = [];
  }

  openAddUsersAndUserGroupModal() {
    $('#addChangeUserAndGroup').modal("show");
  }

  downloadAttachment(chatAttachment) {
    this.chat_attachment_name = chatAttachment.file_name
    this.chat_attachment_url = chatAttachment.url
    $("#downloadAttachment").modal("show");
  }

  addGoal(type) {
    this.planItemType = type;

    if (this.planItemType && this.planItemType == 'goal') {
      this.planItemModalTitle = 'Goal';
    }

    if (this.planItemType && this.planItemType == 'strategy') {
      this.planItemModalTitle = 'Strategy';
    }

    $("#addGoalModal").modal("show");
  }

  onGoalSubmit() {
    this.isGoalFormSubmitted = true;

    if (this.goalForm.invalid) {
      return;
    } else {
      var planStartDate = this.sharedPlanDetails.start_date;
      var planEndDate = this.sharedPlanDetails.end_date;
      var plan_id = this.sharedPlanDetails._id;

      var goalStartDate = $('#date-input5').val();
      var goalEndDate = $('#date-input6').val();

      if (goalStartDate != '' && goalEndDate != '') {
        if (new Date(goalStartDate) > new Date(goalEndDate)) {
          this.toastr.error("Start date should be greater than End Date", "Error");
        } else {
          if (new Date(planStartDate) <= new Date(goalStartDate) && new Date(planEndDate) >= new Date(goalStartDate) && new Date(planStartDate) <= new Date(goalEndDate) && new Date(planEndDate) >= new Date(goalEndDate)) {
            var url;
            var data = this.goalForm.value;
            data.editid = '';
            data.user_id = this.currentUserId;
            data.plan_id = plan_id;
            data.status = 0;
            data.numbers = 0;
            data.start_date = goalStartDate;
            data.end_date = goalEndDate;
            data.controls = this.goalControls;

            if (this.planItemType && this.planItemType == 'goal') {
              url = `${this.slug}goal/create`;

              if (this.selectedGoal && this.selectedGoal != null && this.selectedGoal._id) {
                data.parent_goal_id = this.selectedGoal._id;
              }
            }

            if (this.planItemType && this.planItemType == 'strategy') {
              url = `${this.slug}goal/create/strategy`;
            }

            this.commonService.PostAPI(url, data).then((response: any) => {
              if (response.status) {
                this.toastr.success(response.message, "Success");
                this.getPlanGoals();
                this.isGoalFormSubmitted = false;
                this.goalForm.reset();
                $("#addGoalModal").modal("hide");

                if (this.planItemType && this.planItemType == 'goal') {
                  if (this.selectedGoal && this.selectedGoal != null && this.selectedGoal._id) {
                    this.getChildGoals(this.selectedGoal._id);
                  }
                }

                this.goalControls = [];
                this.formField = [{ name: '', type: '', required: '', label: '', value: '', userid: this.currentUserId }];
              } else {
                this.toastr.error(response.message, "Error");
              }
            });
          } else {
            this.toastr.error("Goal start date and end date are between " + moment(planStartDate).format('DD-MM-YYYY') + " and " + moment(planEndDate).format('DD-MM-YYYY') + ".", "Error");
          }
        }
      } else {
        if (goalStartDate == '') {
          this.toastr.error("Please Enter Start Date", "Error");
        } else if (goalEndDate == '') {
          this.toastr.error("Please Enter End Date", "Error");
        }
      }
    }
  }

  textDecoration(string) {
    var newString = string.replace(/_/g, " ");
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }

  /* Start Add dynamic form controls in goal and statergy */

  // Open form controls modal
  openFormControlModal() {
    $("#addFormControlToGoal").modal('show');
  }

  // add new control in plan form
  onAddNewControl() {
    this.formField.push({ name: '', type: '', required: '', label: '', value: '', userid: this.currentUserId })
  }

  // remove form control 
  onRemoveFormControl(i) {
    if (this.formField && this.formField.length > 1) {
      var key = this.formField[i]["name"];
      delete this.data[0][key];
      this.goalForm = this.formBuilder.group(this.data[0]);

      this.formField.splice(i, 1);
    }
  }

  //On control type option select event
  getSelectOptions(e, i) {
    var option = e.target.value;

    this.formField[i]["type"] = option;

    if (option == "select") {
      this.formField[i]["option"] = [];
    } else {
      var key = "option";
      delete this.formField[i][key]
    }
  }

  //on input control label select box event
  setControlLabel(controlName, i) {
    this.formField[i]["name"] = controlName;
    this.formField[i]["label"] = controlName;
  }

  //On change required select box event
  setRequiredValue(requiredValue, i) {
    this.formField[i]["required"] = requiredValue;
  }

  //modal of add multiple option in select box
  addControlSelectOptions(i) {
    this.selectoption = this.formField[i]['option'];
    $("#addSelectOptions").modal("show");
    $("#controlid").val(i)
  }

  // Add Options
  onAddOption() {
    this.selectoption.push({ id: '' })
  }

  // Remove option
  removeoption(i) {
    var index = $("#controlid").val();
    this.formField[index]['option'] = this.selectoption;
    delete this.formField[index]['option'][i]

    this.formField[index]['option'].splice(i, 1)
  }

  //Save added options
  saveOption() {
    var index = $("#controlid").val();
    this.formField[index]['option'] = this.selectoption;
    $("#addSelectOptions").modal("hide");
  }

  // Save selected controls to the goal form
  saveControlFields() {
    this.goalControls = this.formField;

    var i = 0;
    var j = 0;
    var k = 0;
    var valid = [];
    var selectbox = [];

    this.goalControls.forEach(element => {
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

    this.goalForm = this.formBuilder.group(this.data[0]);

    if (i == 0) {
      if (j == 0) {
        if (k == 0) {
          $("#addFormControlToGoal").modal('hide');
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

  // Open Strategy modal
  openStrategyModal(data, planDetails) {
    this.selectedStrategy = data;
    this.sharedPlanDetails = planDetails;

    this.getStrategyAttachments(this.selectedStrategy._id);
    this.getStrategyChatMessageDetails();

    if (this.currentUserId == this.sharedPlanDetails.user_id) {
      this.can_access_goal = true;
    } else {
      this.can_access_goal = false;
    }

    this.isOpenStrategyModal = true;
    $('body').addClass('overflow-hidden');
  }

  // Close Modal
  closeStrategyModal() {
    this.isOpenStrategyModal = false;
    this.selectedStrategy = '';
  }

  // Upload Strategy Attachments
  uploadStrategyAttachment(event) {
    this.attachStrategyAttachments = event;

    const formData: any = new FormData();
    const files: Array<File> = this.attachStrategyAttachments;

    for (let i = 0; i < files.length; i++) {
      formData.append("attachments", files[i], files[i]['name']);
    }

    formData.append('strategy_id', this.selectedStrategy._id);

    this.commonService.PostAPI(`${this.slug}goal/strategy/store/attachments`, formData).then((response: any) => {
      if (response.status) {
        this.getStrategyAttachments(this.selectedStrategy._id);
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "File Upload Error!");
      }
    });
  }

  //Get Strategy Attachments
  getStrategyAttachments(strategy_id) {
    this.commonService.PostAPI(`${this.slug}goal/strategy/get/attachments`, { strategy_id: strategy_id }).then((response: any) => {
      if (response.status) {
        this.strategyAttachments = response.data;
      } else {
        this.strategyAttachments = []
      }
    });
  }

  //Delete Strategy attachment
  deleteStrategyAttachment(strategy_attachment_id, strategy_id) {
    this.commonService.PostAPI(`${this.slug}goal/strategy/attachments/delete`, { strategy_attachment_id: strategy_attachment_id }).then((response: any) => {
      if (response.status) {
        this.getStrategyAttachments(strategy_id)
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  // Send an attachment in chat
  sendStrategyAttachment(event) {
    this.strategyChatAttachment = event;
  }

  // Send message from strategy modal using socket
  sendStrategyMessage() {
    if ((this.sendStrategyMessageForm.value.message && this.sendStrategyMessageForm.value.message != '') || (this.strategyChatAttachment && this.strategyChatAttachment.length > 0)) {
      var data = this.sendStrategyMessageForm.value;
      data.sender_id = this.currentUserId;
      data.strategy_id = this.selectedStrategy._id;

      if (this.strategyChatAttachment && this.strategyChatAttachment.length > 0) {
        var nameArr = [];
        var attachments = [];

        for (let index = 0; index < this.strategyChatAttachment.length; index++) {
          const element = this.strategyChatAttachment[index];
          nameArr.push(element.name)
          attachments.push(element)
        }

        data.attachment_name = nameArr;
        data.attachments = attachments;
      }

      this.chatService.sendStrategyMessage(data);
      this.sendStrategyMessageForm.reset();
      this.strategyChatAttachment = [];
    }
  }

  //Delete strategy chat uploaded attachment
  deleteStrategyUploadedAttachment(index) {
    var fileKey: any = parseInt(index);
    var files: File[] = [];

    if (this.strategyChatAttachment && this.strategyChatAttachment.length > 0) {
      for (const key in this.strategyChatAttachment) {
        if (this.strategyChatAttachment.hasOwnProperty(key)) {
          if (key != fileKey) {
            const element = this.strategyChatAttachment[key];
            files.push(element);
          }
        }
      }
    } else {
      files = [];
    }

    this.strategyChatAttachment = files;
  }

  //Get strategy chat messages
  getStrategyChatMessageDetails() {
    this.commonService.PostAPI(`${this.slug}goal/strategy/get/chat`, { strategy_id: this.selectedStrategy._id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.userStrategyChats = response.data;

        setTimeout(() => {
          var container = document.getElementById("strategy-chat-attachment-div");
          container.scrollTop = container.scrollHeight;
          container.scrollIntoView({ block: 'end' });
        }, 600);
      } else {
        this.userStrategyChats = [];
      }
    });
  }

  getChildGoals(parent_goal_id) {
    this.commonService.PostAPI(`${this.slug}goal/get/childs`, { parent_goal_id: parent_goal_id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.childGoals = response.data;
      } else {
        this.childGoals = [];
      }
    });
  }


  /* End Add dynamic form controls in goal and statergy */

  // Change Manaement
  openAddOpportunityAndProblemModal() {
    $("#addOpportunityAndProblemModal").modal("show");
  }

  submitOpportunityAndProblem() {
    this.isChangeFormFormValid = true;
    if (this.changeForm.invalid) {
      return;
    } else {
      var data = this.changeForm.value;
      data.plan_id = this.sharedPlanDetails._id;
      data.user_id = this.currentUserId;

      this.commonService.PostAPI(`${this.slug}plan/store/opportunity/problem`, data).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");

          this.isChangeFormFormValid = false;
          this.changeForm.reset();

          $("#addOpportunityAndProblemModal").modal("hide");

          this.getOpportunityAndProblem();
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }

  getOpportunityAndProblem() {
    this.commonService.PostAPI(`${this.slug}plan/get/opportunity/problem`, { plan_id: this.sharedPlanDetails._id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.opportunityProblems = response.data;

        setTimeout(() => {
          var container = document.getElementById("upper-content");
          container.scrollTop = container.scrollHeight;
          container.scrollIntoView({ block: 'end' });

          var container = document.getElementById("lower-content");
          container.scrollTop = container.scrollHeight;
          container.scrollIntoView({ block: 'end' });
        }, 600);
      } else {
        this.opportunityProblems = [];
      }
    });
  }

  openChallangeChatModel(element) {
    this.challangeDetails = element;
    this.getChallangeAttachments(this.challangeDetails._id);

    this.getChallangeChatMessageDetails();
    this.isOpenChallangeManagementModal = true;
  }

  closeChallangeModal() {
    this.isOpenChallangeManagementModal = false;
  }

  // Upload Challange Attachments
  uploadChallangeAttachment(event) {
    this.attachChallangeAttachments = event;

    const formData: any = new FormData();
    const files: Array<File> = this.attachChallangeAttachments;

    for (let i = 0; i < files.length; i++) {
      formData.append("attachments", files[i], files[i]['name']);
    }

    formData.append('challange_id', this.challangeDetails._id);

    this.commonService.PostAPI(`${this.slug}plan/challange/store/attachments`, formData).then((response: any) => {
      if (response.status) {
        this.getChallangeAttachments(this.challangeDetails._id);
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "File Upload Error!");
      }
    });
  }

  //Get Challange Attachments
  getChallangeAttachments(challange_id) {
    this.commonService.PostAPI(`${this.slug}plan/challange/get/attachments`, { challange_id: challange_id }).then((response: any) => {
      if (response.status) {
        this.challangeAttachments = response.data;
      } else {
        this.challangeAttachments = []
      }
    });
  }

  //Delete Challange attachment
  deleteChallangeAttachment(challange_attachment_id, challange_id) {
    this.commonService.PostAPI(`${this.slug}plan/challange/attachments/delete`, { challange_attachment_id: challange_attachment_id }).then((response: any) => {
      if (response.status) {
        this.getChallangeAttachments(challange_id)
        this.toastr.success(response.message, "Success");
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  //Delete challange chat uploaded attachment
  deleteChallangeUploadedAttachment(index) {
    var fileKey: any = parseInt(index);
    var files: File[] = [];

    if (this.challangeChatAttachment && this.challangeChatAttachment.length > 0) {
      for (const key in this.challangeChatAttachment) {
        if (this.challangeChatAttachment.hasOwnProperty(key)) {
          if (key != fileKey) {
            const element = this.challangeChatAttachment[key];
            files.push(element);
          }
        }
      }
    } else {
      files = [];
    }

    this.challangeChatAttachment = files;
  }

  // Send an attachment in chat
  sendChallangeAttachment(event) {
    this.challangeChatAttachment = event;
  }

  // Send message from challange modal using socket
  sendChallangeMessage() {
    if ((this.sendChallangeMessageForm.value.message && this.sendChallangeMessageForm.value.message != '') || (this.challangeChatAttachment && this.challangeChatAttachment.length > 0)) {
      var data = this.sendChallangeMessageForm.value;
      data.sender_id = this.currentUserId;
      data.challange_id = this.challangeDetails._id;

      if (this.challangeChatAttachment && this.challangeChatAttachment.length > 0) {
        var nameArr = [];
        var attachments = [];

        for (let index = 0; index < this.challangeChatAttachment.length; index++) {
          const element = this.challangeChatAttachment[index];
          nameArr.push(element.name)
          attachments.push(element)
        }

        data.attachment_name = nameArr;
        data.attachments = attachments;
      }

      this.chatService.sendChallangeMessage(data);
      this.sendChallangeMessageForm.reset();
      this.challangeChatAttachment = [];
    }
  }

  //Get strategy chat messages
  getChallangeChatMessageDetails() {
    this.commonService.PostAPI(`${this.slug}plan/challange/get/chat`, { challange_id: this.challangeDetails._id }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.userChallangeChats = response.data;

        setTimeout(() => {
          var container = document.getElementById("challange-chat-attachment-div");
          container.scrollTop = container.scrollHeight;
          container.scrollIntoView({ block: 'end' });
        }, 600);
      } else {
        this.userChallangeChats = [];
      }
    });
  }
}

@Pipe({ name: 'itemplandate' })
export class itemplandate implements PipeTransform {
  transform(value: string) {
    var datePipe = new DatePipe("en-US");
    value = datePipe.transform(value, 'dd/MM/yyyy');

    return value;
  }
}