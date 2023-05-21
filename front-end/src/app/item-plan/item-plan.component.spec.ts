import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPlanComponent } from './item-plan.component';

describe('ItemPlanComponent', () => {
  let component: ItemPlanComponent;
  let fixture: ComponentFixture<ItemPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
