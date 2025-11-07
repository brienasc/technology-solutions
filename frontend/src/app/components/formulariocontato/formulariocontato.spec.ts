import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Formulariocontato } from './formulariocontato';

describe('Formulariocontato', () => {
  let component: Formulariocontato;
  let fixture: ComponentFixture<Formulariocontato>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formulariocontato]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Formulariocontato);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
