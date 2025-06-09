import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Thumbnail } from './thumbnail';

describe('Thumbnail', () => {
  let component: Thumbnail;
  let fixture: ComponentFixture<Thumbnail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Thumbnail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Thumbnail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
