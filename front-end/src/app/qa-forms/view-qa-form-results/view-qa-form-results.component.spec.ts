import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQaFormResultsComponent } from './view-qa-form-results.component';

describe('ViewQaFormResultsComponent', () => {
  let component: ViewQaFormResultsComponent;
  let fixture: ComponentFixture<ViewQaFormResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewQaFormResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewQaFormResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
