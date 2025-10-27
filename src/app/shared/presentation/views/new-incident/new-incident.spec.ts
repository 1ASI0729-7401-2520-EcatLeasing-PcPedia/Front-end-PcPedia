import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewIncident } from './new-incident';

describe('NewIncident', () => {
  let component: NewIncident;
  let fixture: ComponentFixture<NewIncident>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewIncident]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewIncident);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
