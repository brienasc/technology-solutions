import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rodape } from './rodape';

describe('Rodape', () => {
  let component: Rodape;
  let fixture: ComponentFixture<Rodape>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rodape]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rodape);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
