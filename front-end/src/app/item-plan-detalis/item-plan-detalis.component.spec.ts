import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPlanDetalisComponent } from './item-plan-detalis.component';

describe('ItemPlanDetalisComponent', () => {
  let component: ItemPlanDetalisComponent;
  let fixture: ComponentFixture<ItemPlanDetalisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPlanDetalisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPlanDetalisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
