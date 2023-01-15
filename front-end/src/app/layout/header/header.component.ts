import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from "src/app/services/common.service";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUser: any = [];
  panelOpenState = false;
  permissiongrant = false
  currentchildUser;

  AdminRole = "Admin";
  currentUserRole = "";

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"

  constructor(
    private toastr: ToastrService,
    public authService: AuthenticationService,
    public router: Router,

    public commonService: CommonService,
  ) {
    // redirect to home if already logged in
    if (!this.authService.currentUserValue) {
      this.logout();
    }
    this.currentUser = this.authService.currentUserValue;
    this.currentUserRole = this.currentUser.role;
  }

  ngOnInit() {
    //Added stylesheet for menu
    document.getElementById('collapsed-sidebar-logo').style.display = "none";

    this.checkforpriotizeanddeactivate();
    this.setchilduser();
    this.setparentuser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  setActiveMenu(action) {
    if (this.router.url == action) {
      return true;
    } else {
      return false;
    }
  }

  setchilduser() {
    this.commonService.PostAPI(`${this.slug}hierarchy/user/child`, {
      user_id: this.currentUser.user._id
    }).then((response: any) => {
      if (response.status) {
        if (response.data) {
          var user_ids = response.data.map(data => data.user_id)

          if (this.currentUser.role == "User") {
            localStorage.setItem('currentchildUser', JSON.stringify(user_ids));
          }
        }
      } else {
        // this.toastr.error(response.message, "Error");
      }
    });
  }
  setparentuser() {
    this.commonService.PostAPI(`${this.slug}hierarchy/user/parent`, {
      user_id: this.currentUser.user._id
    }).then((response: any) => {
      if (response.status) {
        if (response.data) {
          var user_ids = response.data.map(data => data.user_id)
          if (this.currentUser.role == "User") {
            user_ids.splice(user_ids.indexOf(this.currentUser.user._id), 1);
            localStorage.setItem('currentparentUser', JSON.stringify(user_ids));
          }
        }
      } else {
        // this.toastr.error(response.message, "Error");
      }
    });
  }

  checkforpriotizeanddeactivate() {
    this.currentchildUser = JSON.parse(window.localStorage.getItem("currentchildUser"));
    this.commonService.PostAPI(`${this.slug}plan/get/allplanselectbox`, { id: this.currentUser.user._id, childids: this.currentchildUser }).then((response: any) => {
      if (response.status) {
        if (response.data.length > 0) {
          this.permissiongrant = true;
        }
      } else {
        this.toastr.error(response.message, "Error");
      }
    });
  }

  isExpanded(actions) {
    if (actions) {
      return actions.includes(this.router.url);
    }
  }

  checkUserRole() {
    if (this.currentUserRole === this.AdminRole) {
      return true;
    } else {
      return false;
    }
  }

  mouseEnter(e) {
    var body = document.getElementsByTagName("BODY")[0];

    if (body.classList.value == "pace-done page-sidebar-collapsed") {
      var classList = e.target.classList.value;

      if (classList.includes('is-active') == true) {
        document.getElementById('cdk-accordion-child-1').style.display = 'block'
        document.getElementById('cdk-accordion-child-2').style.display = 'block'
      }
    }
  }

  mouseLeave(e) {
    var body = document.getElementsByTagName("BODY")[0];

    if (body.classList.value == "pace-done page-sidebar-collapsed") {
      var classList = e.target.classList.value;

      if (classList.includes('is-active') == true) {
        document.getElementById('cdk-accordion-child-1').style.display = 'none'
        document.getElementById('cdk-accordion-child-2').style.display = 'none'
      }
    }
  }
}
