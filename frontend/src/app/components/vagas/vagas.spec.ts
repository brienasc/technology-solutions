import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vagas } from './vagas';

describe('Vagas', () => {
  let component: Vagas;
  let fixture: ComponentFixture<Vagas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vagas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vagas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
