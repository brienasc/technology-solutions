import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalhes } from './modal-detalhes';

describe('ModalDetalhes', () => {
  let component: ModalDetalhes;
  let fixture: ComponentFixture<ModalDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetalhes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDetalhes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
