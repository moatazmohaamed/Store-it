import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Authfrom } from './authfrom';

describe('Authfrom', () => {
  let component: Authfrom;
  let fixture: ComponentFixture<Authfrom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Authfrom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Authfrom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
