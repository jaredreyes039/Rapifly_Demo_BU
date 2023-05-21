import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "src/app/services/common.service";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { map } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-add-qa-forms',
  templateUrl: './add-qa-forms.component.html',
  styleUrls: ['./add-qa-forms.component.css']
})
export class AddQaFormsComponent implements OnInit {

  qaForm: any = FormGroup;
  isQAFormSubmitted: boolean = false;

  qaFullForm: any = FormGroup;
  isQAFullFormSubmitted: boolean = false;

  currentUser;
  currentUserId;
  parentUserId;

  formField = [{ name: '', type: '', required: '', label: '', value: '' }];
  selectoption = [{ id: '' }];
  data: any = [{}];

  qaFormControls: any = [];

  //Multiselect Dropdown
  plans: any = [];
  selected: any;

  // Edit Forms
  editedFormId: any;
  editedFormDetail: any;

  pageTitle: any = "Add Q&A Form";



  constructor(
    private toastr: ToastrService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private authService: AuthenticationService
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.currentUserId = this.currentUser.user._id;
    this.parentUserId = this.currentUser.user.parent_user_id;

    if(this.route.snapshot.params && this.route.snapshot.params.id && this.route.snapshot.params.id != ''){
      this.editedFormId = this.route.snapshot.params.id;
    }
  }

  ngOnInit() {
    this.qaForm = this.formBuilder.group(this.data[0]);

    this.qaFullForm = this.formBuilder.group({
      'form_name': ['', Validators.required],
      'plan': ['', Validators.required]
    });

    // get user's all plan
    this.getUserPlan();

    if(this.editedFormId && this.editedFormId != null){
      this.getFormDetails(this.editedFormId)
    }
  }

  getFormDetails(form_id){
    this.commonService.PostAPI(`qa/get/form/by/id`, { form_id: form_id }).then((response: any) => {
      if (response.status) {
        this.editedFormDetail = response.data;
        this.selected = this.editedFormDetail.plan_id;

        this.formField = JSON.parse(this.editedFormDetail.form_controls);
        this.qaFormControls = JSON.parse(this.editedFormDetail.form_controls);

        this.formField.forEach(element => {
          if (element.required == "true") {
            this.data[0][element.name] = ['', Validators.required];
          } else {
            this.data[0][element.name] = [''];
          }
        });
    
        this.qaForm = this.formBuilder.group(this.data[0]);

        this.pageTitle = "Edit Q&A Form";
      } else {
        this.editedFormDetail;
      }
    });
  }

  getUserPlan() {
    this.commonService.PostAPI(`plan/get/of/user`, { user_id: this.currentUserId }).then((response: any) => {
      if (response.status && response.data && response.data.length > 0) {
        this.plans = response.data;
      } else {
        this.plans = [];
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.qaForm.controls; }

  // convenience getter for easy access to form fields
  get qaf() { return this.qaFullForm.controls; }

  /* Start Add dynamic form controls in Q&A */
  openFormControlModal() {
    $("#formControlModal").modal("show");
  }

  // add new control in plan form
  onAddNewControl() {
    this.formField.push({ name: '', type: '', required: '', label: '', value: '' })
  }

  // remove form control 
  onRemoveFormControl(i) {
    if (this.formField && this.formField.length > 1) {
      var key = this.formField[i]["name"];
      delete this.data[0][key];
      this.qaForm = this.formBuilder.group(this.data[0]);

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
    var i = 0;
    var j = 0;
    var k = 0;
    var valid = [];
    var selectbox = [];

    this.formField.forEach(element => {
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

    this.qaForm = this.formBuilder.group(this.data[0]);

    if (i == 0) {
      if (j == 0) {
        if (k == 0) {
          this.qaFormControls = this.formField;
          $("#formControlModal").modal('hide');
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

  textDecoration(string) {
    var newString = string.replace(/_/g, " ");
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }

  onSubmit() {
    this.isQAFormSubmitted = true;

    if (this.qaForm.invalid) {
      return;
    } else {
      this.toastr.success("Form submitted.")
    }
  }

  onChange(event) {
    this.selected = event;
  }
  /* End Add dynamic form controls in Q&A */

  saveQAForm() {
    this.isQAFullFormSubmitted = true;

    if (this.qaFullForm.invalid) {
      return;
    } else {

      if (this.qaFormControls && this.qaFormControls.length == 0) {
        this.toastr.error("You don't have added any form control. Please add it.", "Error")
        return;
      }

      if (this.selected && Object.entries(this.selected).length === 0) {
        this.toastr.error("Please select any plan.", "Error")
        return;
      }

      var data = this.qaFullForm.value;
      data.plan_id = this.qaFullForm.value.plan._id;
      data.user_id = this.currentUserId;
      data.form_controls = JSON.stringify(this.qaFormControls);
      data.parent_user_id = this.parentUserId;

      this.commonService.PostAPI(`qa/create`, data).then((response: any) => {
        if (response.status) {
          this.isQAFullFormSubmitted = false;
          this.qaFullForm.reset();

          this.qaFormControls = [];
          this.formField = [];

          this.toastr.success(response.message, "Success");
        } else {
          this.toastr.error(response.message, "Error");
        }
      });
    }
  }
}
