import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNovaAvaliacao } from './modal-nova-avaliacao';

describe('ModalNovaAvaliacao', () => {
  let component: ModalNovaAvaliacao;
  let fixture: ComponentFixture<ModalNovaAvaliacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNovaAvaliacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNovaAvaliacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
