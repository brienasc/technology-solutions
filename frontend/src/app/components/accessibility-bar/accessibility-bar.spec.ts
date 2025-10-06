import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityBar } from './accessibility-bar';

describe('AccessibilityBar', () => {
  let component: AccessibilityBar;
  let fixture: ComponentFixture<AccessibilityBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibilityBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
