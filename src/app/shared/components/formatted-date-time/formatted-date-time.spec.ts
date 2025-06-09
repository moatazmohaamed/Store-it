import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormattedDateTime } from './formatted-date-time';

describe('FormattedDateTime', () => {
  let component: FormattedDateTime;
  let fixture: ComponentFixture<FormattedDateTime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormattedDateTime]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormattedDateTime);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
