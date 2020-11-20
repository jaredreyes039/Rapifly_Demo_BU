import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaFormsComponent } from './qa-forms.component';

describe('QaFormsComponent', () => {
  let component: QaFormsComponent;
  let fixture: ComponentFixture<QaFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
