import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabRoundTripDialogComponent } from './cab-round-trip-dialog.component';

describe('CabRoundTripDialogComponent', () => {
  let component: CabRoundTripDialogComponent;
  let fixture: ComponentFixture<CabRoundTripDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabRoundTripDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CabRoundTripDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
