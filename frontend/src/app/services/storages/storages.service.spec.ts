/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StoragesService } from './storages.service';

describe('Service: Storages', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoragesService]
    });
  });

  it('should ...', inject([StoragesService], (service: StoragesService) => {
    expect(service).toBeTruthy();
  }));
});
