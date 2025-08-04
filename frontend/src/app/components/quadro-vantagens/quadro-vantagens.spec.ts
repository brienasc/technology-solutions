import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuadroVantagensComponent } from './quadro-vantagens';

describe('QuadroVantagens', () => {
  let component: QuadroVantagensComponent;
  let fixture: ComponentFixture<QuadroVantagensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuadroVantagensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuadroVantagensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});