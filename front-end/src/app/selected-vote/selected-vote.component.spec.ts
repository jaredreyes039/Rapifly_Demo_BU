import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedVoteComponent } from './selected-vote.component';

describe('SelectedVoteComponent', () => {
  let component: SelectedVoteComponent;
  let fixture: ComponentFixture<SelectedVoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedVoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
