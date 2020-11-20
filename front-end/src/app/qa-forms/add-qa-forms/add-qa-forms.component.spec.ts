import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQaFormsComponent } from './add-qa-forms.component';

describe('AddQaFormsComponent', () => {
  let component: AddQaFormsComponent;
  let fixture: ComponentFixture<AddQaFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddQaFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQaFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
