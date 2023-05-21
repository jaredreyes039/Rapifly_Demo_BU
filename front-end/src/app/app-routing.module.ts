import { HierarchyDiagramComponent } from './hierarchy-diagram/hierarchy-diagram.component';
import { UsersComponent } from './users/users.component';
import { HeirarchyComponent } from './admin/heirarchy/heirarchy.component';
import { OrganizationsComponent } from './admin/organizations/organizations.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgetEmailComponent } from './forget/forget-email/forget-email.component';
import { ResetPasswordComponent } from './forget/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './helpers/auth.guard';
import { GuestAuthGuard } from './helpers/guestAuth.guard';
import { ItemPlanComponent } from './item-plan/item-plan.component';

import { LevelsComponent } from './admin/levels/levels.component';
import { RolesComponent } from './admin/roles/roles.component';
import { InviteUsersComponent } from './admin/invite-users/invite-users.component';
import { RegisterInviteUserComponent } from './register-invite-user/register-invite-user.component';
import { AddplanComponent } from './addplan/addplan.component';
import { ItemPlanDetailsComponent } from './item-plan-detalis/item-plan-detalis.component';
import { PrioritizeComponent } from './prioritize/prioritize.component';
import { DeactivateComponent } from './deactivate/deactivate.component';
import { ProposeComponent } from './propose/propose.component';
import { VoteComponent } from './vote/vote.component';
import { SelectedVoteComponent } from './selected-vote/selected-vote.component';
import { DelegateComponent } from './delegate/delegate.component';
import { CountdownComponent } from './countdown/countdown.component';
import { LaunchComponent } from './launch/launch.component';
import { ReportComponent } from './report/report.component';
import { MeasureComponent } from './measure/measure.component';
import { ImproveComponent } from './improve/improve.component';
import { ProfileComponent } from './profile/profile.component';
import { ManageHieararchyComponent } from './manage-hieararchy/manage-hieararchy.component';
import { ChangeHieararchyComponent } from './change-hieararchy/change-hieararchy.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { UserGroupsComponent } from './user-groups/user-groups/user-groups.component';
import { AddUserGroupsComponent } from './user-groups/add-user-groups/add-user-groups.component';
import { AddQaFormsComponent } from './qa-forms/add-qa-forms/add-qa-forms.component';
import { QaFormsComponent } from './qa-forms/qa-forms/qa-forms.component';
import { FillUpFormComponent } from './qa-forms/fill-up-form/fill-up-form.component';
import { ViewQaFormResultsComponent } from './qa-forms/view-qa-form-results/view-qa-form-results.component';
import { RegisterComponent } from './coach/register/register.component';
import { ListComponent } from './coach/list/list.component';
import { EditPlanComponent } from './edit-plan/edit-plan.component';

export enum Role {
  Admin = 'Admin',
  User = 'User'
}

const routes: Routes = [
  { path: '', redirectTo: '/item-plans-details', pathMatch: 'full' },
  { path: 'sign-in', component: LoginComponent, canActivate: [GuestAuthGuard] },
  { path: 'sign-up', component: SignupComponent, canActivate: [GuestAuthGuard] },
  { path: 'forgot/password', component: ForgetEmailComponent, canActivate: [GuestAuthGuard] },
  { path: 'reset/password/:id/:token', component: ResetPasswordComponent, canActivate: [GuestAuthGuard] },
  {
    path: 'register/invited/users/:id', component: RegisterInviteUserComponent,
    canActivate: [GuestAuthGuard]
  },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin, Role.User]
    }
  },
  {
    path: 'item-plans', component: ItemPlanComponent, canActivate: [AuthGuard], data: {
      roles: [Role.User]
    }
  },
  {
    path: 'item-plans/:id', component: ItemPlanComponent, canActivate: [AuthGuard], data: {
      roles: [Role.User]
    }
  },
  {
    path: 'item-plans-details', component: ItemPlanDetailsComponent, canActivate: [AuthGuard], data: {
      roles: [Role.User]
    }
  },
  {
    path: 'item-plan/:planId', component: EditPlanComponent, canActivate: [AuthGuard], data: {
      roles: [Role.User]
    }
  },
  {
    path: 'add/plan', component: AddplanComponent, canActivate: [AuthGuard], data: {
      roles: [Role.User]
    }
  },
  {
    path: 'item-plans/manage', component: AddplanComponent, canActivate: [AuthGuard], data: {
      roles: [Role.User]
    }
  },
  {
    path: 'invite/user', component: InviteUsersComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin, Role.User]
    }
  },
  {
    path: 'hierarchy', component: HeirarchyComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin, Role.User]
    }
  },
  {
    path: 'hierarchy/manage', component: ManageHieararchyComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin, Role.User]
    }
  },
  {
    path: 'hierarchy/change', component: ChangeHieararchyComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin, Role.User]
    }
  },
  {
    path: 'prioritize', component: PrioritizeComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'deactivate', component: DeactivateComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'propose', component: ProposeComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'vote', component: VoteComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'select', component: SelectedVoteComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin, Role.User]
    }
  },
  {
    path: 'delegate', component: DelegateComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'countdown', component: CountdownComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'launch', component: LaunchComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'report', component: ReportComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'measure', component: MeasureComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'improve', component: ImproveComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'setting', component: AdminSettingsComponent, canActivate: [AuthGuard], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'user-groups', component: UserGroupsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'user-groups/add', component: AddUserGroupsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'user-groups/edit/:id', component: AddUserGroupsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'qa/forms', component: QaFormsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'qa/forms/add', component: AddQaFormsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'qa/forms/edit/:id', component: AddQaFormsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'qa/forms/fill-up/:id', component: FillUpFormComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'qa/forms/result/:id', component: ViewQaFormResultsComponent, canActivate: [AuthGuard], data: {
      roles: []
    }
  },
  {
    path: 'coach/register', component: RegisterComponent, canActivate: [GuestAuthGuard]
  },
  {
    path: 'coaches-corner', component: ListComponent
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
