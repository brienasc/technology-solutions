import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNovaAvaliacaoComponent } from './modal-nova-avaliacao';

describe('ModalNovaAvaliacaoComponent', () => {
  let component: ModalNovaAvaliacaoComponent;
  let fixture: ComponentFixture<ModalNovaAvaliacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNovaAvaliacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNovaAvaliacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
