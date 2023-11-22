/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DirectoriesService } from './directories.service';

describe('Service: Directories', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectoriesService]
    });
  });

  it('should ...', inject([DirectoriesService], (service: DirectoriesService) => {
    expect(service).toBeTruthy();
  }));
});
