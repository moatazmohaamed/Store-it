import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OTPmodel } from './otpmodel';

describe('OTPmodel', () => {
  let component: OTPmodel;
  let fixture: ComponentFixture<OTPmodel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OTPmodel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OTPmodel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
