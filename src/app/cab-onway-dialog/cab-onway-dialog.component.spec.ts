import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabOnwayDialogComponent } from './cab-onway-dialog.component';

describe('CabOnwayDialogComponent', () => {
  let component: CabOnwayDialogComponent;
  let fixture: ComponentFixture<CabOnwayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabOnwayDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CabOnwayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
