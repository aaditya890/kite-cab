import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCustomerRecordDeleteComponent } from './confirm-customer-record-delete.component';

describe('ConfirmCustomerRecordDeleteComponent', () => {
  let component: ConfirmCustomerRecordDeleteComponent;
  let fixture: ComponentFixture<ConfirmCustomerRecordDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmCustomerRecordDeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmCustomerRecordDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
