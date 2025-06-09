import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fileuploader } from './fileuploader';

describe('Fileuploader', () => {
  let component: Fileuploader;
  let fixture: ComponentFixture<Fileuploader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fileuploader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fileuploader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
