import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { LocationService } from '../location.service';

export interface PriceDialogData {
  distance: any;
  pickupLocation: string;
  dropLocation: string;
  price: any;
  waitingTime?: any;
  approxDistance?: any;
  sedanPrice: any;
  suvPrice: any;
  mobileNumber: number;
}

@Component({
  selector: 'app-cab-round-trip-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, NgxMatTimepickerModule, MatSelectModule, MatInputModule, MatIconModule, MatDialogActions, MatDialogClose, MatDialogContent, MatButtonModule, MatDialogTitle,],
  templateUrl: './cab-round-trip-dialog.component.html',
  styleUrls: ['./cab-round-trip-dialog.component.scss']
})
export class CabRoundTripDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CabRoundTripDialogComponent>);
  isBookNow: Boolean = false;
  isCustomerRecordAdded: Boolean = false;
  customerForm!: FormGroup;
  bookingCabDetail:any;
  readonly data = inject<PriceDialogData>(MAT_DIALOG_DATA);
  FieldsData = { pickupLocation: this.data.pickupLocation, dropLocation: this.data.dropLocation, basePrice: this.data.price, waitingTime: this.data.waitingTime, approxDistance: this.data.approxDistance || 0, distance: this.data.distance, sedanPrice: this.data.sedanPrice, suvPrice: this.data.suvPrice, mobileNumber: this.data.mobileNumber };

  constructor(private fb: FormBuilder, private locationService: LocationService) { }

  ngOnInit(): void {
    const basePrice = 0;
    const approxDistance = this.FieldsData.approxDistance;
    const hours = this.FieldsData.waitingTime;

    if (hours === '1-3 hours' || hours === '3-6 hours') {
      this.FieldsData.basePrice = basePrice + (approxDistance * 10 + 1200); // ₹10 + 1-6hour price per km for hatchback
      this.FieldsData.sedanPrice = basePrice + (approxDistance * 11 + 1200); // ₹11 + 1-6hour price per km for sedan
      this.FieldsData.suvPrice = basePrice + (approxDistance * 16 + 1400); // ₹16 + 1-6hour price per km for SUV
    }
    else if (hours === '6-9 hours') {
      this.FieldsData.basePrice = basePrice + (approxDistance * 10 + 1300); // ₹10 + 6-9hour price per km for hatchback
      this.FieldsData.sedanPrice = basePrice + (approxDistance * 11 + 1300); // ₹11 + 6-9hour price per km for sedan
      this.FieldsData.suvPrice = basePrice + (approxDistance * 16 + 1500); // ₹16 + 6-9hour price per km for SUV
    }
    else if (hours == '1 day') {
      this.FieldsData.basePrice = basePrice + (approxDistance * 10 + 1400); // ₹10 + 1 Day price per km for hatchback
      this.FieldsData.sedanPrice = basePrice + (approxDistance * 11 + 1500); // ₹11 + 1 Day price per km for sedan
      this.FieldsData.suvPrice = basePrice + (approxDistance * 16 + 1600); // ₹16 + 1 Day price per km for SUV
    }
    else if (hours === '2 day') {
      this.FieldsData.basePrice = basePrice + (approxDistance * 10 + 2800); // ₹10 + 2 Day price per km for hatchback
      this.FieldsData.sedanPrice = basePrice + (approxDistance * 11 + 3000); // ₹11 + 2 Day price per km for sedan
      this.FieldsData.suvPrice = basePrice + (approxDistance * 16 + 3200); // ₹16 + 2 Day price per km for SUV
    }
    else {
      this.FieldsData.basePrice = basePrice + (approxDistance * 10 + 4200); // ₹10 + 3 Day price per km for hatchback
      this.FieldsData.sedanPrice = basePrice + (approxDistance * 11 + 4500); // ₹11 + 3 Day price per km for sedan
      this.FieldsData.suvPrice = basePrice + (approxDistance * 16 + 4800); // ₹16 + 3 Day price per km for SUV
    }

    this.customerForm = this.fb.group({
      fullName: ['', Validators.required],
      pickupDate: ['', Validators.required],
      pickupTime: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      numberOfPassengers: ['', [Validators.required, Validators.min(1)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  public bookCab(carType: string, FieldsData: any, price: number): void {
    const roundTripBookingDetail: any = {
      bookingType: "round-trip",
      carType: carType,
      pickupLocation: FieldsData.pickupLocation,
      dropLocation: FieldsData.dropLocation,
      price: price,
      waitingTime: FieldsData.waitingTime,
      distance: FieldsData.distance,
      approxDistance: FieldsData.approxDistance,
      mobileNumber: FieldsData.mobileNumber
    }
    this.isBookNow = roundTripBookingDetail ? true : false;
    this.bookingCabDetail =  roundTripBookingDetail
  }

  public isFieldInvalid(field: string) {
    return this.customerForm.get(field)?.invalid && this.customerForm.get(field)?.touched;
  }

  public submitCustomerDetails() {
    this.customerForm.value.pickupDate = new Date(this.customerForm.value.pickupDate).toDateString();
    this.isCustomerRecordAdded = this.customerForm.value ? true : false;

    const payload = {
      customerDetail: this.customerForm.value,
      bookingDetail: this.bookingCabDetail
    };

    this.locationService.addCustomerRecord(payload).subscribe(response => {});
  }
}
