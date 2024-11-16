import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { LocationService } from '../location.service';

export interface LocalRental {
  pickupLocation: string;
  package: string;
  mobileNumber: number;
  hours?: number;
  distance?: number;
  sedanPrice: number;
  hatchbackPrice: number;
  suvPrice: number;
}

@Component({
  selector: 'app-cab-rental-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatIconModule, NgxMatTimepickerModule, MatSelectModule, MatNativeDateModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './cab-rental-dialog.component.html',
  styleUrl: './cab-rental-dialog.component.scss'
})
export class CabRentalDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CabRentalDialogComponent>);
  readonly data = inject<LocalRental>(MAT_DIALOG_DATA);
  isBookNow: Boolean = false;
  isCustomerRecordAdded: Boolean = false;
  customerForm!: FormGroup;
  bookingCabDetail: any;
  FieldsData = { pickupLocation: this.data.pickupLocation, package: this.data.package, mobileNumber: this.data.mobileNumber, hatchbackPrice: this.data.hatchbackPrice, sedanPrice: this.data.sedanPrice, suvPrice: this.data.suvPrice };

  constructor(private fb: FormBuilder, private locationService: LocationService) { }

  ngOnInit(): void {
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

  public isFieldInvalid(field: string): any {
    return this.customerForm.get(field)?.invalid && this.customerForm.get(field)?.touched;
  }

  public bookCab(carType: string, FieldsData: any, price: number): void {
    const localRentalBookingDetail = {
      bookingType: "local-rental",
      carType: carType,
      pickupLocation: FieldsData.pickupLocation,
      price: price,
      package: FieldsData.package,
      mobileNumber: FieldsData.mobileNumber
    }
    this.isBookNow = localRentalBookingDetail ? true : false;
    this.bookingCabDetail = localRentalBookingDetail;
  }

  public submitCustomerDetails(): void {
    this.customerForm.value.pickupDate = new Date(this.customerForm.value.pickupDate).toDateString();
    this.isCustomerRecordAdded = this.customerForm.value ? true : false;

    const payload = {
      customerDetail: this.customerForm.value,
      bookingDetail: this.bookingCabDetail
    };

    this.locationService.addCustomerRecord(payload).subscribe(response => {
      console.log("Record added:", response);
    });
  }

  public reloadPage(): void {
    window.location.reload()
  }

} 