import { Component, Inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule, NgModel, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatInputModule, MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChip } from '@angular/material/chips';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip'
import { CommonModule, DOCUMENT, NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CabOnwayDialogComponent } from '.././cab-onway-dialog/cab-onway-dialog.component';
import { DialogCallComponent } from '.././dialog-call/dialog-call.component';
import { CabRoundTripDialogComponent } from '.././cab-round-trip-dialog/cab-round-trip-dialog.component';
import { LocationService } from '.././location.service';
import { CabRentalDialogComponent } from '.././cab-rental-dialog/cab-rental-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { map, startWith, filter, forkJoin } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatSnackBarModule, MatAutocompleteModule, CommonModule, MatTooltipModule, MatAutocomplete, MatAutocompleteModule, MatIconModule, MatChipsModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatInput, MatInputModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {
  activeForm: string = 'oneWay';
  oneWayForm!: FormGroup;
  roundTripForm!: FormGroup;
  localRentalForm!: FormGroup;
  ifCheckPrice: boolean = false;
  pickupFields: string[] = [];
  dropFields: string[] = [];
  filteredOnwayPickupFields: string[] = [];
  filteredOnwayDropFields: string[] = [];
  filteredRoundTripPickupFields: string[] = [];
  filteredRoundTripDropFields: string[] = [];
  filteredLocalRentalPickupFields: string[] = [];
  waitingTimes: string[] = ['1-3 hours', '3-6 hours', '6-9 hours', '1 day', '2 day', '3 day'];
  rentalFieldData: any[] = [];
  cabPrice: number | null = null;
  cabDistance: number | null = null;
  locations: { [pickup: string]: { [drop: string]: { price: number; distance: number, sedanPrice: number, suvPrice: number, active?: boolean } } } = {};

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private locationService: LocationService,
    private snackBar: MatSnackBar,
    private http:HttpClient
  ) { }

  ngOnInit(): void {
    this.initializeData();

    this.oneWayForm = this.fb.group({
      pickupLocation: ['', [Validators.required]],
      dropLocation: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });

    this.roundTripForm = this.fb.group({
      pickupLocation: ['', [Validators.required]],
      dropLocation: ['', [Validators.required]],
      waitingTime: ['', [Validators.required]],
      approxDistance: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });

    this.localRentalForm = this.fb.group({
      pickupLocation: ['', [Validators.required]],
      package: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    });

  }
  
  // Function to fetch data and set up autocomplete after data is ready
  private initializeData(): void {
    // Use forkJoin to wait for both observables to complete
    forkJoin([
      this.locationService.getLocationPrices(),
      this.locationService.getRentalPackages()
    ]).subscribe(([locationData, rentalData]) => {
      this.processLocationData(locationData);
      this.rentalFieldData = rentalData;

      // Set up autocomplete options after data has been loaded
      this.setupAutoCompleteOptions();
    }, error => {
      console.error('Error fetching data:', error);
    });
  }

  // Return autocomplete filtered data 
  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Filter autocomplete data 
  public filteredAutoCompleteOptions(originalArray: string[], filteredArray: string[], control: FormControl): void {
    control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', originalArray))
    ).subscribe(filteredResults => {
      filteredArray.length = 0;
      filteredArray.push(...filteredResults);
    }, error => console.error('Error in valueChanges subscription:', error));
  }

  // Initialize autocomplete functionality for each form control
  private setupAutoCompleteOptions(): void {
    this.filteredAutoCompleteOptions(this.pickupFields, this.filteredOnwayPickupFields, this.oneWayForm.get('pickupLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.dropFields, this.filteredOnwayDropFields, this.oneWayForm.get('dropLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.pickupFields, this.filteredRoundTripPickupFields, this.roundTripForm.get('pickupLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.dropFields, this.filteredRoundTripDropFields, this.roundTripForm.get('dropLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.pickupFields, this.filteredLocalRentalPickupFields, this.localRentalForm.get('pickupLocation') as FormControl);
  }

  // Process location data and populate pickup and drop fields
  private processLocationData(data: any[]): void {
    const pickupSet = new Set<string>();
    const dropSet = new Set<string>();

    data.forEach(item => {
      const { pickup, dropoff, price, sedanPrice, suvPrice, distance, active } = item;

      if (!this.locations[pickup]) {
        this.locations[pickup] = {};
      }
      this.locations[pickup][dropoff] = {
        price,
        sedanPrice,
        suvPrice,
        distance,
        active: active !== false,
      };

      pickupSet.add(pickup);
      dropSet.add(dropoff);
    });

    this.pickupFields = Array.from(pickupSet);
    this.dropFields = Array.from(dropSet);
  }

  // check fare action for all forms
  public checkCabPrice(formType: string): void {
    let pickupLocation: string;
    let dropLocation: string;

    if (formType === 'oneWay' && this.oneWayForm.valid) {
      pickupLocation = this.oneWayForm.value.pickupLocation;
      dropLocation = this.oneWayForm.value.dropLocation;
      this.registerForEnquiry(pickupLocation, dropLocation, this.oneWayForm.value.mobileNumber)
      this.onWayCheckFare(pickupLocation, dropLocation);
    } else if (formType === 'roundTrip' && this.roundTripForm.valid) {
      pickupLocation = this.roundTripForm.value.pickupLocation;
      dropLocation = this.roundTripForm.value.dropLocation;
      this.registerForEnquiry(pickupLocation, dropLocation, this.roundTripForm.value.mobileNumber)
      this.roundTripFare(pickupLocation, dropLocation);
    } else if (formType === 'localRental' && this.localRentalForm.valid) {
      this.localRentalFare();
      this.registerForEnquiry(this.localRentalForm.value.pickupLocation, this.localRentalForm.value.package, this.localRentalForm.value.mobileNumber)
    } else {
      return;
    }
  }

  // onway check fare action
  public onWayCheckFare(pickupLocation: string, dropLocation: string):void {
    const locationData = this.locations[pickupLocation]?.[dropLocation];
    if (locationData && locationData.active == true) {
      this.cabPrice = locationData.price;
      this.cabDistance = locationData.distance;

      this.dialog.open(CabOnwayDialogComponent, {
        width: '25rem',
        height: '38rem',
        maxHeight: '100rem',
        data: {
          pickupLocation: pickupLocation,
          dropLocation: dropLocation,
          price: this.cabPrice,
          distance: this.cabDistance,
          sedanPrice: locationData.sedanPrice,
          suvPrice: locationData.suvPrice,
          mobileNumber: this.oneWayForm.value.mobileNumber
        },
      });
    } else {
      this.ifCheckPrice = true;
      this.cabPrice = null;
      this.cabDistance = null;
      this.snackBar.open("No cabs are available for the selected locations.", "Close", {
        duration: 3000, // optional: set duration for the snackbar
      });
    }
  }

   // round trips check fare action
  public roundTripFare(pickupLocation: string, dropLocation: string):void {
    const locationData = this.locations[pickupLocation]?.[dropLocation];
    if (locationData && locationData.active == true) {
      this.cabPrice = locationData.price;
      this.cabDistance = locationData.distance;

      this.dialog.open(CabRoundTripDialogComponent, {
        width: '25rem',
        height: '40rem',
        maxHeight: '100rem',
        data: {
          pickupLocation: pickupLocation,
          dropLocation: dropLocation,
          price: locationData.price,
          distance: this.cabDistance,
          waitingTime: this.roundTripForm.value.waitingTime,
          approxDistance: this.roundTripForm.value.approxDistance,
          sedanPrice: locationData.sedanPrice,
          suvPrice: locationData.suvPrice,
          mobileNumber: this.roundTripForm.value.mobileNumber
        }
      });
    } else {
      this.ifCheckPrice = true;
      this.cabPrice = null;
      this.cabDistance = null;
      this.snackBar.open("No cabs are available for the selected locations.", "Close", {
        duration: 3000, // optional: set duration for the snackbar
      });
    }
  }

   // local rental check fare action
  public localRentalFare():void {
    const selectedPackage = this.rentalFieldData.find((res) => {
      const rentalPackage = `${res.time} ${res.distance}km`.toLowerCase();
      const selectedPackage = this.localRentalForm.value.package.toLowerCase();

      // Check if both have "day" or "hour" as part of the `time`
      if ((rentalPackage.includes("day") && selectedPackage.includes("day")) ||
        (rentalPackage.includes("hour") && selectedPackage.includes("hour"))) {
        return rentalPackage === selectedPackage;
      }
      return false; // No match found if time units don't align
    });
    if (selectedPackage) {
      // Open the dialog and send all the necessary data
      this.dialog.open(CabRentalDialogComponent, {
        width: '25rem',
        height: '40rem',
        maxHeight: '100rem',
        data: {
          pickupLocation: this.localRentalForm.value.pickupLocation,
          package: this.localRentalForm.value.package,
          mobileNumber: this.localRentalForm.value.mobileNumber,
          hours: selectedPackage.time,
          distance: selectedPackage.distance,
          sedanPrice: selectedPackage.sedanPrice,
          hatchbackPrice: selectedPackage.hatchbackPrice,
          suvPrice: selectedPackage.suvPrice
        }
      });
    } else {
      this.snackBar.open("No matching package found.", "Close", {
        duration: 2000
      })
    }
  }

  // Register data for customer enquiry
  public registerForEnquiry(pickupLocation: string, dropLocation: string, mobileNumber: string) {
    const enquiryData: any = {
      pickupLocation: pickupLocation,
      dropLocationOrPackages: dropLocation,
      mobileNumber: mobileNumber,
      date: new Date().toLocaleDateString(),  // Current date in locale format
      time: new Date().toLocaleTimeString()    // Current time in locale format
    };
    this.locationService.setEnquiryRecord(enquiryData).subscribe((res: any) => {
      this.sendEmail(enquiryData.pickupLocation , enquiryData.dropLocationOrPackages, enquiryData.mobileNumber)
    })
  }

  public sendEmail(pickupLocation: any, dropLocation: any, mobileNumber: number) {
    const payload = {
      to: ['kitecab00@gmail.com'], // Recipient
      subject: 'New Enquiry from KiteCab',
      html: `
        <p>Enquiry details:</p>
        <ul>
          <li><strong>Pickup Location:</strong> ${pickupLocation}</li>
          <li><strong>Drop Location:</strong> ${dropLocation}</li>
          <li><strong>Mobile Number:</strong> ${mobileNumber}</li>
        </ul>
      `
    };
  
    const backendUrl = 'https://backend-email-sender.onrender.com/send-email'; // Replace with your backend URL
  
    this.http.post(backendUrl, payload).subscribe({
      next: (res) => {
        // console.log('Email sent successfully:', res);
      },
      error: (err) => {
        // console.error('Error sending email:', err);
      }
    });
  }
  
  // Open calling dialog
  public bookingByCall(): void {
    this.dialog.open(DialogCallComponent, {});
  }

  // Redirect to whatapp 
  public bookingByWhatsapp(): void {
    const phoneNumber = "+916263676216";
    const message = `Hi! I would like to proceed with a cab booking. Please confirm the car availability and provide the fare details.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }

  // Show form by selected chip
  public toggleForm(formType: string): void {
    this.activeForm = formType;
  }

}
