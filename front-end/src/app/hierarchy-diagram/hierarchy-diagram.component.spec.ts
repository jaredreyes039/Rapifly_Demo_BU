import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyDiagramComponent } from './hierarchy-diagram.component';

describe('HierarchyDiagramComponent', () => {
  let component: HierarchyDiagramComponent;
  let fixture: ComponentFixture<HierarchyDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HierarchyDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
