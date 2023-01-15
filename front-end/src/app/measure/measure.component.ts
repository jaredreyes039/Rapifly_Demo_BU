import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonService } from "src/app/services/common.service";
import * as moment from 'moment';
import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.css']
})
export class MeasureComponent implements OnInit {

  hoveredDate: NgbDate;

  fromDate;
  toDate;

  currentuser;
  currentchildUser;
  planDetails: any = [];
  isDetailsFound: boolean = false;

  startDate: any = '';
  endDate: any = '';

  // Use slug to connect w/ prod API
  // Must end with /
  slug = "https://lionfish-app-czku6.ondigitalocean.app/"

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

  constructor(
    private toastr: ToastrService,
    public authenticationService: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter
  ) {
    this.currentuser = JSON.parse(window.localStorage.getItem("currentUser"));
    this.toDate = calendar.getToday();
    this.fromDate = calendar.getPrev(calendar.getToday(), 'm', 1);
  }

  ngOnInit() {
    this.getPlanGoalDetails();
  }

  onChangeDate() {
    this.getPlanGoalDetails();
  }

  getPlanGoalDetails() {
    var from_date = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    var to_date = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;

    var fromDateTimestamp = new Date(from_date).getTime();
    var toDateTimestamp = new Date(to_date).getTime();

    if (toDateTimestamp < fromDateTimestamp) {
      this.toastr.error("To date should be smaller than From date.", "Filter Validation Error");
    } else {
      this.commonService.PostAPI(`${this.slug}plan/get/by/user`, {
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

}
