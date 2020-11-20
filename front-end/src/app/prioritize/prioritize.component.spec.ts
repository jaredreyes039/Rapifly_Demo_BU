import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritizeComponent } from './prioritize.component';

describe('PrioritizeComponent', () => {
  let component: PrioritizeComponent;
  let fixture: ComponentFixture<PrioritizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrioritizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrioritizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
