import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrirComponent } from './abrir.component';

describe('AbrirComponent', () => {
  let component: AbrirComponent;
  let fixture: ComponentFixture<AbrirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbrirComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbrirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
