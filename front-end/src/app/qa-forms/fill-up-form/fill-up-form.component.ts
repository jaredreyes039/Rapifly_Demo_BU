import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "src/app/services/common.service";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fill-up-form',
  templateUrl: './fill-up-form.component.html',
  styleUrls: ['./fill-up-form.component.css']
})
export class FillUpFormComponent implements OnInit {

  qaForm: FormGroup;
  isQAFormSubmitted: boolean = false;

  currentUser;
  currentUserId;
  parentUserId;

  formField = [{ name: '', type: '', required: '', label: '', value: '' }];
  selectoption = [{ id: '' }];
  data: any = [{}];

  qaFormControls: any = [];

  formId: any;
  formDetail: any;

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

    if (this.route.snapshot.params && this.route.snapshot.params.id && this.route.snapshot.params.id != '') {
      this.formId = this.route.snapshot.params.id;
    }
  }

  ngOnInit() {
    this.qaForm = this.formBuilder.group(this.data[0]);

    if (this.formId && this.formId != null) {
      this.getFormDetails(this.formId)
    }
  }

  getFormDetails(form_id) {
    this.commonService.PostAPI('qa/get/form/by/id', { form_id: form_id }).then((response: any) => {
      if (response.status) {
        this.formDetail = response.data;

        this.formField = JSON.parse(this.formDetail.form_controls);

        this.formField.forEach(element => {
          if (element.required == "true") {
            this.data[0][element.name] = ['', Validators.required];
          } else {
            this.data[0][element.name] = [''];
          }
        });

        this.qaForm = this.formBuilder.group(this.data[0]);
      } else {
        this.formDetail;
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.qaForm.controls; }

  textDecoration(string) {
    var newString = string.replace(/_/g, " ");
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }

  onSubmit() {
    this.isQAFormSubmitted = true;

    if (this.qaForm.invalid) {
      return;
    } else {
      var data = this.qaForm.value;
      data.user_id = this.currentUserId;
      data.form_name = this.formDetail.form_name;

      this.commonService.PostAPI('qa/form/save', data).then((response: any) => {
        if (response.status) {
          this.toastr.success(response.message, "Success");
          this.router.navigate(['/qa/forms']);
          this.resetForm();        
        } else {
          this.toastr.error(response.message, "Error")
        }
      });
    }
  }

  resetForm() {
    this.isQAFormSubmitted = false;
    this.qaForm.reset();
  }
}
