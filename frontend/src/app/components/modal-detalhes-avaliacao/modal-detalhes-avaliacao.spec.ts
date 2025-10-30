import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalhesAvaliacao } from './modal-detalhes-avaliacao';

describe('ModalDetalhesAvaliacao', () => {
  let component: ModalDetalhesAvaliacao;
  let fixture: ComponentFixture<ModalDetalhesAvaliacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetalhesAvaliacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDetalhesAvaliacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
