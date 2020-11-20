import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "src/app/services/common.service";
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-edit-plan',
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.css']
})
export class EditPlanComponent implements OnInit {

  parentplangroup: FormGroup;
  currentuser;
  IsLoginFormValid = false;
  editid;
  planDetails: any = [];
  action;
  userid;
  showcustomtag = false;

  data = [{}]

  formfield = [{ name: '', type: '', required: '', label: '', value: '', userid: this.userid }]
  selectoption = [{ id: '' }]

  //Multiselect Dropdown
  items = [];
  selected = [];
  selectedUsers = [];

  final = [];
  datafinal = this.final;

  childUsers: any = [];

  constructor(
    private toastr: ToastrService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) {
    this.childUsers = JSON.parse(window.localStorage.getItem('currentchildUser'));
  }

  ngOnInit() {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    this.userid = this.currentuser.user._id;
    this.IsLoginFormValid = false;
    this.editid = this.route.snapshot.params['planId'];

    if (this.editid != undefined) {
      this.getPlanDetails();
      this.action = "Edit";
    } else {
      this.action = "Add New";
    }
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

    this.data[0]["numbers"] = [''];
    this.data[0]["short_name"] = ['', Validators.required];
    this.data[0]["long_name"] = ['', Validators.required];
    this.data[0]["description"] = [''];
    this.data[0]["start_date"] = [''];
    this.data[0]["end_date"] = [''];
    this.data[0]["security"] = ['', Validators.required];
    this.data[0]["share_users"] = [''];
    this.parentplangroup = this.formBuilder.group(this.data[0]);
    if (this.editid == undefined) {
      this.getplanform();
    }
    this.parentplangroup.get('security').setValue('');
    $('#date-input5').on('changeDate', function (ev) {
      $(this).datepicker('hide');
    });
    $('#date-input6').on('changeDate', function (ev) {
      $(this).datepicker('hide');
    });

    this.getChildUsers();
  }

  getChildUsers() {
    this.commonService.PostAPI('users/get/designations', { user_ids: this.childUsers }).then((response: any) => {
      if (response) {
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
      }
    });
  }

  getplanform() {
    /**
     * Plan form detail from admin
     */

    this.commonService.PostAPI('plan/getform/by/id', { userid: this.userid }).then((response: any) => {
      if (response.status) {
        this.final = response.data.palnformfield;

        this.datafinal = response.data.palnformfield;
        this.formfield = response.data.palnformfield;
        if (response.data.palnformfield.length == 0) {
          this.formfield = [{ name: '', type: '', required: '', label: '', value: '', userid: this.userid }]
        }
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

  getPlanDetails() {
    /**
    * Plan detail get using id
    */
    this.commonService.PostAPI('plan/get/by/id', { plan_id: this.editid }).then((response: any) => {
      if (response.status) {
        this.planDetails = response.data;
        var usersArr = [];

        if (this.planDetails.shared_users && this.planDetails.shared_users.length > 0) {
          this.planDetails.shared_users.forEach(element => {
            var data = {
              id: element.user_id._id,
              name: `${element.user_id.first_name} ${element.user_id.last_name} - ${element.hierarchy_id.designation}`
            };
            usersArr.push(data);
          });
        }
        this.selected = usersArr;

        var datePipe = new DatePipe("en-US");
        $('#date-input5').datepicker('setDate', datePipe.transform(this.planDetails.start_date, 'MM/dd/yyyy'));
        $('#date-input6').datepicker('setDate', datePipe.transform(this.planDetails.end_date, 'MM/dd/yyyy'));
        this.getplanform();
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }
  get jval() {
    return this.parentplangroup.controls;
  }
  fetch() {
    this.datafinal = this.final;

    // this.formfield = [{name:'',type:'',required:'',label: '',value: '',userid:this.userid}]
    $("#myModal").modal("show");

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
          this.commonService.PostAPI('plan/create/form', this.formfield).then((response: any) => {
            if (response.status) {
              this.toastr.success(response.message, "Success");
              $("#myModal").modal("hide");
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

  // remove form control plan form 
  removeData(i) {
    /*
    * remove key of element from formfield array
    * modified at: 19-03-2020 12:42 PM
    * author: Hardik Gadhiya
    */
    this.formfield.splice(i, 1)
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

  submit(form) {
    /**
      * plan form save
      */
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
          data.shared_permission_users = this.selected.map(data => data.id);

          this.commonService.PostAPI('plan/create/parent', data).then((response: any) => {
            if (response.status) {
              this.toastr.success(response.message, "Success");
              setTimeout(() => {
                this.router.navigate(['/item-plans']);
              }, 2000);
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
        } else {

        }
      }
    }
  }

  reset() {
    this.IsLoginFormValid = false;
    this.parentplangroup.reset();
    this.parentplangroup.get('security').setValue('');
  }

  onChange(e) {
    this.selected = e;
  }

}
