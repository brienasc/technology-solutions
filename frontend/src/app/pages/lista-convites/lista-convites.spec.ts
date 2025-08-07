import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaConvitesComponent } from './lista-convites'; 

describe('ListaConvitesComponent', () => { 
  let component: ListaConvitesComponent; 
  let fixture: ComponentFixture<ListaConvitesComponent>; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaConvitesComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaConvitesComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
