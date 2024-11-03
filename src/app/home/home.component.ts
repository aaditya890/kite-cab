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
import { map, startWith, filter } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, AsyncPipe, MatSnackBarModule, CommonModule, RouterLink, MatTooltipModule, MatAutocomplete, MatAutocompleteModule, MatTooltip, MatIconModule, MatChipsModule, MatChip, NgClass, MatButtonModule, MatSelectModule, MatFormFieldModule, MatInput, MatInputModule, ReactiveFormsModule, FormsModule],
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
  
  ) { }

  ngOnInit(): void {
    this.getDataFromService();
    this.getLocalRentalData();
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

    this.filteredAutoCompleteOptions(this.pickupFields, this.filteredOnwayPickupFields, this.oneWayForm.get('pickupLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.dropFields, this.filteredOnwayDropFields, this.oneWayForm.get('dropLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.pickupFields, this.filteredRoundTripPickupFields, this.roundTripForm.get('pickupLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.dropFields, this.filteredRoundTripDropFields, this.roundTripForm.get('dropLocation') as FormControl);
    this.filteredAutoCompleteOptions(this.pickupFields, this.filteredLocalRentalPickupFields, this.localRentalForm.get('pickupLocation') as FormControl);
  }

  private _filter(value: string, array: string[]): string[] {
    const filterValue = value.toLowerCase();
    return array.filter(option => option.toLowerCase().includes(filterValue));
  }

  public filteredAutoCompleteOptions(originalArray: string[], filteredArray: string[], control: FormControl): void {
    control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', originalArray))
    ).subscribe(filteredResults => {
      filteredArray.length = 0; filteredArray.push(...filteredResults);
    });
  }

  public getLocalRentalData() {
    this.locationService.getRentalPackages().subscribe((res: any[]) => {
      this.rentalFieldData = res;
    })

  }

  private getDataFromService(): void {
    this.locationService.getLocationPrices().subscribe({
      next: (data) => {
        const pickupSet = new Set<string>();
        const dropSet = new Set<string>();

        for (const item of data) {
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
        }

        this.pickupFields = Array.from(pickupSet);
        this.dropFields = Array.from(dropSet);
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }

  public bookingByCall(): void {
    this.dialog.open(DialogCallComponent, {});
  }

  public bookingByWhatsapp(): void {
    const phoneNumber = "+916263676216";
    const message = `Hi! I’d like to proceed with a cab booking. Please confirm the car availability and provide the fare details.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }

  public toggleForm(formType: string): void {
    this.activeForm = formType;
  }

  public checkCabPrice(formType: string): void {
    let pickupLocation: string;
    let dropLocation: string;

    if (formType === 'oneWay' && this.oneWayForm.valid) {
      pickupLocation = this.oneWayForm.value.pickupLocation;
      dropLocation = this.oneWayForm.value.dropLocation;
      this.onWayCheckFare(pickupLocation, dropLocation);
    } else if (formType === 'roundTrip' && this.roundTripForm.valid) {
      pickupLocation = this.roundTripForm.value.pickupLocation;
      dropLocation = this.roundTripForm.value.dropLocation;
      this.roundTripFare(pickupLocation, dropLocation);
    } else if (formType === 'localRental' && this.localRentalForm.valid) {
      this.localRentalFare();
    } else {
      return;
    }
  }

  public onWayCheckFare(pickupLocation: string, dropLocation: string) {
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
    }
  }

  public roundTripFare(pickupLocation: string, dropLocation: string) {
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
    }
  }

  public localRentalFare() {
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

  get navigateToAdmin() {
    return this.router.navigate(['/admin']);
  }

}
