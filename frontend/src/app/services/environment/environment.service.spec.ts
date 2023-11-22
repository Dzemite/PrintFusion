/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EnvironmentService } from './environment.service';

describe('Service: Environment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService]
    });
  });

  it('should ...', inject([EnvironmentService], (service: EnvironmentService) => {
    expect(service).toBeTruthy();
  }));
});
