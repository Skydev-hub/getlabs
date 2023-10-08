import { TestBed, waitForAsync } from '@angular/core/testing';
import { UiModule } from './ui.module';

describe('UiModule', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [UiModule],
      }).compileComponents();
    })
  );

  it('should create', () => {
    expect(UiModule).toBeDefined();
  });
});
