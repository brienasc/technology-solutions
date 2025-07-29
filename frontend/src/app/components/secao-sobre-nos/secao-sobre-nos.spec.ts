import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecaoSobreNos } from './secao-sobre-nos';

describe('SecaoSobreNos', () => {
  let component: SecaoSobreNos;
  let fixture: ComponentFixture<SecaoSobreNos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecaoSobreNos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecaoSobreNos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
