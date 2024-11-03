import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabRentalDialogComponent } from './cab-rental-dialog.component';

describe('CabRentalDialogComponent', () => {
  let component: CabRentalDialogComponent;
  let fixture: ComponentFixture<CabRentalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabRentalDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CabRentalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
