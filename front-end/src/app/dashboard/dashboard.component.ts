import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';

import { ChartType } from 'chart.js';
import { MultiDataSet, Label, Colors } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentuser;
  currentUserId;

  goalReport: any = [];
  isReportAvailable: Boolean = false;

  doughnutChartLabels: Label[] = ['Total Goals', 'Completed Goals', 'Remaining Goals', 'Overdue Goals'];
  doughnutChartData: MultiDataSet = [
    [0, 0, 0, 0]
  ];
  doughnutChartType: ChartType = 'doughnut';

  donutColors = [
    {
      backgroundColor: [
        'rgba(115, 109, 255, 1), rgba(169, 127, 255, 1)',
        'rgba(253, 101, 133, 1), rgba(255, 211, 165, 1)',
        'rgba(249, 180, 189, 1), rgba(149, 115, 219, 1)',
        'rgba(68, 222, 197, 1), rgba(78, 188, 250, 1)',
      ],
      hoverBackgroundColor: [
        'rgba(115, 109, 255, 1), rgba(169, 127, 255, 1)',
        'rgba(253, 101, 133, 1), rgba(255, 211, 165, 1)',
        'rgba(249, 180, 189, 1), rgba(149, 115, 219, 1)',
        'rgba(68, 222, 197, 1), rgba(78, 188, 250, 1)',
      ],
      borderColor: [
        'white',
        'white',
        'white',
        'white'
      ],
      borderWidth: 3
    }
  ];

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public commonService: CommonService
  ) {
    this.currentuser = this.authService.currentUserValue;
    this.currentUserId = this.currentuser.user._id;
  }

  ngOnInit() {
    this.getGoalsSummaryDetails();
  }

  getGoalsSummaryDetails() {
    if (this.currentuser.role == "Admin") {
      this.commonService.PostAPI('goal/get/report/by/admin', { user_id: this.currentUserId }).then((response: any) => {
        if (response.status) {
          this.goalReport = response.data;

          this.doughnutChartData = [
            this.goalReport.total_goals,
            this.goalReport.completed_goals,
            this.goalReport.remaining_goals,
            this.goalReport.overdue_goals,
          ];

          this.isReportAvailable = true;
        } else {
          this.isReportAvailable = false;
        }
      });
    } else if (this.currentuser.role == "User") {
      this.commonService.PostAPI('goal/get/report', { user_id: this.currentUserId }).then((response: any) => {
        if (response.status) {
          this.goalReport = response.data;

          this.doughnutChartData = [
            this.goalReport.total_goals,
            this.goalReport.completed_goals,
            this.goalReport.remaining_goals,
            this.goalReport.overdue_goals,
          ];

          this.isReportAvailable = true;
        } else {
          this.isReportAvailable = false;
        }
      });
    }
  }

}
