import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Funcionalidades } from './funcionalidades';

describe('Funcionalidades', () => {
  let component: Funcionalidades;
  let fixture: ComponentFixture<Funcionalidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Funcionalidades]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Funcionalidades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
