import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPlanDetailsComponent } from './item-plan-detalis.component';

describe('ItemPlanDetalisComponent', () => {
  let component: ItemPlanDetailsComponent;
  let fixture: ComponentFixture<ItemPlanDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPlanDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
