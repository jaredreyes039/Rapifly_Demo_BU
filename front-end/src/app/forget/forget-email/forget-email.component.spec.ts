import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetEmailComponent } from './forget-email.component';

describe('ForgetEmailComponent', () => {
  let component: ForgetEmailComponent;
  let fixture: ComponentFixture<ForgetEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
