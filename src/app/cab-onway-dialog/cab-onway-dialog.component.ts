import { Component, Inject, inject, model, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { LocationService } from '../location.service';

export interface PriceDialogData {
  waitingTime: any;
  dropLocation: string;
  pickupLocation: string;
  suvPrice: number;
  sedanPrice: number;
  price: number;
  distance: any;
  mobileNumber: number;
}
@Component({
  selector: 'app-cab-onway-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatIconModule, NgxMatTimepickerModule, MatDialogModule, MatDatepickerModule, MatSelectModule, MatNativeDateModule, MatInputModule, ReactiveFormsModule, FormsModule, MatFormFieldModule,MatDialogClose, MatDialogContent, MatButtonModule, MatDialogTitle,],
  templateUrl: './cab-onway-dialog.component.html',
  styleUrl: './cab-onway-dialog.component.scss'
})
export class CabOnwayDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef);
  isBookNow: Boolean = false;
  isCustomerRecordAdded: Boolean = false;
  customerForm!: FormGroup;
  bookingCabDetail: any;
  readonly data = inject<PriceDialogData>(MAT_DIALOG_DATA);
  readonly FieldsData = {
    pickupLocation: this.data.pickupLocation,
    dropLocation: this.data.dropLocation,
    price: this.data.price,
    sedanPrice: this.data.sedanPrice,
    suvPrice: this.data.suvPrice,
    distance: this.data.distance,
    mobileNumber: this.data.mobileNumber
  };

  constructor(private fb: FormBuilder, private locationService: LocationService) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      fullName: ['', Validators.required],
      pickupDate: ['', Validators.required],
      pickupTime: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      numberOfPassengers: ['', [Validators.required, Validators.min(1)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public bookCab(vehicalType: string, price: number, distance: number): any {
    const cabOnwayBookingDetails = {
      bookingType: "oneway",
      carType: vehicalType,
      pickupLocation: this.data.pickupLocation,
      dropLocation: this.data.dropLocation,
      price: price,
      distance: distance,
      mobileNumber: this.data.mobileNumber
    };
    this.isBookNow = !!cabOnwayBookingDetails;
    this.bookingCabDetail = cabOnwayBookingDetails;
  }

  public isFieldInvalid(field: string): any {
    return this.customerForm.get(field)?.invalid && this.customerForm.get(field)?.touched;
  }

  public submitCustomerDetails(): void {
    this.customerForm.value.pickupDate = new Date(this.customerForm.value.pickupDate).toDateString();
    this.isCustomerRecordAdded = !!this.customerForm.value;

    
    const payload = {
      customerDetail: this.customerForm.value,
      bookingDetail: this.bookingCabDetail
    };
    this.locationService.addCustomerRecord(payload).subscribe(response => { });
  }

  public reloadPage(): void {
    window.location.reload()
  }

}
