import { Component } from '@angular/core';
import { RouterOutlet,RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule, FormsModule, NgModel, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule, MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChip } from '@angular/material/chips';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip'
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CabOnwayDialogComponent } from './cab-onway-dialog/cab-onway-dialog.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink, MatTooltipModule, MatAutocomplete, MatAutocompleteModule, MatTooltip, MatIconModule, MatChipsModule, MatChip, NgClass, MatButtonModule, MatSelectModule, MatFormFieldModule, MatInput, MatInputModule, MatToolbarModule, ReactiveFormsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isMenuOpen = false; // Boolean to track the menu state
  activeForm: string = 'oneWay'; // Default form
  oneWayForm!: FormGroup; // Button Field
  roundTripForm!: FormGroup; // Button Field
  localRentalForm!: FormGroup; // Button Field
  ifCheckPrice:boolean = false;
  onwayPickupFields: string[] = ['Bilaspur', 'Baloda', 'Durg']
  onwayDropFields: string[] = ['Raipur', 'Bhilai', 'Amora']

  // Location data with price and distance for each route
  locationPrices: { [pickup: string]: { [drop: string]: { price: number, distance: number } } } = {

    Bilaspur : { Raipur: { price: 500, distance: 120 }, Bhilai: { price: 450, distance: 100 }, Amora: { price: 400, distance: 80 } },

    Baloda : { Raipur: { price: 550, distance: 130 }, Bhilai: { price: 500, distance: 110 }, Amora: { price: 450, distance: 90 } },
    
  };
  cabPrice: number | null = null;
  cabDistance: number | null = null;

  constructor(private fb: FormBuilder,private dialog:MatDialog) { }

  ngOnInit(): void {
    // Initialize forms
    this.oneWayForm = this.fb.group({
      pickupLocation: ['', Validators.required],
      dropLocation: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });

    this.roundTripForm = this.fb.group({
      pickupLocation: ['', Validators.required],
      dropLocation: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });

    this.localRentalForm = this.fb.group({
      pickupLocation: ['', Validators.required],
      duration: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });
  }

  public bookingByCall(): void {

  }

  /**
   * Method For Redirecting Booking Message Via Whatsapp
   */
  public bookingByWhatsapp(): void {
    const phoneNumber = "+916267363477";

    const message = `Hi! I’d like to proceed with a cab booking. Please confirm the car availability and provide the fare details.`;

    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");

  }

  /**
   * For Toggle MenuBar In Mobile or Tab View
   */
  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; // Toggle the menu state
  }

  /**
   * To Switch Form Given Input By The Button -> one way ,round trip ,local rental
   * @param formType 
   */
  public toggleForm(formType: string): void {
    this.activeForm = formType;
  }

  /**
   * Button To Submit Form And Refer Value To Check Cab Price 
   * @param formType 
   */
  public checkCabPrice(formType: string): void {
    // this.dialog.open(CabOnwayDialogComponent, {
    //   data: { price:this.cabPrice, distance:this.cabDistance },
    // });
    if (formType === 'oneWay' && this.oneWayForm.valid) {
      // console.log('One Way Form Values:', this.oneWayForm.value);
      // more
    }
    if (formType === 'roundTrip' && this.roundTripForm.valid) {
      // console.log('Round Trip Form Values:', this.roundTripForm.value);
      // more
    }
    if (formType === 'localRental' && this.localRentalForm.valid) {
      // console.log('Local Rental Form Values:', this.localRentalForm.value);
      // more
    }
    const pickupLocation = this.oneWayForm.value.pickupLocation;
    const dropLocation = this.oneWayForm.value.dropLocation;
    if (pickupLocation && dropLocation && this.locationPrices[pickupLocation] && this.locationPrices[pickupLocation][dropLocation].price !== 0 && this.locationPrices[pickupLocation][dropLocation].distance !== 0) {
      this.cabPrice = this.locationPrices[pickupLocation][dropLocation].price;
      this.cabDistance = this.locationPrices[pickupLocation][dropLocation].distance;
      this.dialog.open(CabOnwayDialogComponent, {
        data: { price:this.cabPrice, distance:this.cabDistance },
      });
    } else {
      this.ifCheckPrice = true;
      this.cabPrice = null;
      this.cabDistance = null;
    }
  }
}

