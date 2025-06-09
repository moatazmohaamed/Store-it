import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mobilenavigation } from './mobilenavigation';

describe('Mobilenavigation', () => {
  let component: Mobilenavigation;
  let fixture: ComponentFixture<Mobilenavigation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mobilenavigation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mobilenavigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
