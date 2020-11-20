import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInviteUserComponent } from './register-invite-user.component';

describe('RegisterInviteUserComponent', () => {
  let component: RegisterInviteUserComponent;
  let fixture: ComponentFixture<RegisterInviteUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterInviteUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterInviteUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
