import { TestBed } from '@angular/core/testing';

import { Appwrite } from './appwrite';

describe('Appwrite', () => {
  let service: Appwrite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Appwrite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
