import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageHieararchyComponent } from './manage-hieararchy.component';

describe('ManageHieararchyComponent', () => {
  let component: ManageHieararchyComponent;
  let fixture: ComponentFixture<ManageHieararchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageHieararchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageHieararchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
