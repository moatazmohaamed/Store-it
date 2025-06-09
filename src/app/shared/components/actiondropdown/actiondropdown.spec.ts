import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Actiondropdown } from './actiondropdown';

describe('Actiondropdown', () => {
  let component: Actiondropdown;
  let fixture: ComponentFixture<Actiondropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Actiondropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Actiondropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
