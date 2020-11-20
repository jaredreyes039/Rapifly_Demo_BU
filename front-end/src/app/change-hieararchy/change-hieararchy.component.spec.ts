import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeHieararchyComponent } from './change-hieararchy.component';

describe('ChangeHieararchyComponent', () => {
  let component: ChangeHieararchyComponent;
  let fixture: ComponentFixture<ChangeHieararchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeHieararchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeHieararchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
