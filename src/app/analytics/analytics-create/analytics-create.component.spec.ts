import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsCreateComponent } from './analytics-create.component';

describe('AnalyticsCreateComponent', () => {
  let component: AnalyticsCreateComponent;
  let fixture: ComponentFixture<AnalyticsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
