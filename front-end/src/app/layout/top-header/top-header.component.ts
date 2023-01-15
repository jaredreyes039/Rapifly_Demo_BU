import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.css']
})
export class TopHeaderComponent implements OnInit {

  currentUser: any;
  currentUserId: any;
  userProfile: any = [];
  isCollapsedSidebar: boolean = false;
  avatarUrl: any = '';

  userDesignation: any;




  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private commonService: CommonService,
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.currentUserId = this.currentUser.user._id;
  }

  ngOnInit() {
    this.getUserProfileDetails();

    var body = document.getElementsByTagName("BODY")[0];
    if (body.classList.value.includes("page-sidebar-collapsed") == true) {
      this.isCollapsedSidebar = false;
      this.collapseSidebar(this.isCollapsedSidebar);
    }

    if (this.currentUser.role == 'User') {
      $(".page-content").attr('style', 'width:100% !important;');
      $(".page-header").attr('style', 'padding-left:0px !important;');
    }
  }

  getUserProfileDetails() {
    this.commonService.PostAPI(`users/profile`, { user_id: this.currentUserId }).then((response: any) => {
      if (response.status) {
        this.userProfile = response.data;
        this.avatarUrl = response.avatar_url;

        this.userDesignation = response.designation;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  collapseSidebar(is_open) {
    var element = document.getElementsByClassName("pace-done");

    if (is_open) {
      this.isCollapsedSidebar = false;
      for (var i = 0; i < element.length; i++) {
        element[i].classList.remove("page-sidebar-collapsed");
      }

      document.getElementById('full-sidebar-logo').style.display = "block";
      document.getElementById('collapsed-sidebar-logo').style.display = "none";
      document.getElementById('logo-box').style.padding = "12px";
    } else {

      this.isCollapsedSidebar = true;
      for (var i = 0; i < element.length; i++) {
        element[i].classList.add("page-sidebar-collapsed");
      }

      document.getElementById('full-sidebar-logo').style.display = "none";
      document.getElementById('collapsed-sidebar-logo').style.display = "block";
      document.getElementById('logo-box').style.padding = "10px";
    }
  }
}
