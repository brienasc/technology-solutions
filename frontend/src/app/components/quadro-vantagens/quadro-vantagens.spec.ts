import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuadroVantagens } from './quadro-vantagens';

describe('QuadroVantagens', () => {
  let component: QuadroVantagens;
  let fixture: ComponentFixture<QuadroVantagens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuadroVantagens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuadroVantagens);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
