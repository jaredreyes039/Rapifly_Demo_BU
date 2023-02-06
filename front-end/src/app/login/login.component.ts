import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  IsLoginFormValid = false;

  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) { }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get jval() {
    return this.loginForm.controls;
  }

  Login(form) {
    this.IsLoginFormValid = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      this.authenticationService.login(this.jval.email.value, this.jval.password.value)
        .pipe(first())
        .subscribe((response: any) => {
          console.log(response)
          if (response.status) {
            console.log(typeof response.data.user.passwordChanged);
            if (response.data.user.passwordChanged) {
              if (response.data && response.data.role == 'User') {
                this.router.navigate(['/item-plans-details']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.router.navigate(['/profile'])
            }
          } else {
            console.log(response)
            this.toastr.error(response.message, "Error");
          }
        }, (error: any) => {
          console.log(error)
          this.toastr.error(error, "Error");
        });
    }
  }

}