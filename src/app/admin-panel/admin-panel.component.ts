import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService } from '../location.service';
import { MatInputModule, MatInput } from '@angular/material/input';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AuthService } from '../auth.service';
import { ConfirmCustomerRecordDeleteComponent } from '../confirm-customer-record-delete/confirm-customer-record-delete.component';


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [ReactiveFormsModule, NgxMatTimepickerModule, MatDatepickerModule, MatTableModule, MatCardModule, MatDialogModule, CommonModule, MatChipsModule, MatButtonModule, MatSlideToggleModule, MatTable, MatIconModule, FormsModule, MatInputModule, MatInput, MatTableModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  priceForm: FormGroup;
  rentalForm: FormGroup;
  filterOnwayTableFields: FormGroup;
  locationPrices: any[] = [];
  filteredLocationPrices: any[] = []
  localRentalPackages: any[] = [];
  editingId: any;
  editingRentalId: number | null = null;
  id: string | undefined;
  customerRecordEditForm!: FormGroup;
  customerRecords: any[] = [];
  filteredRecords = [...this.customerRecords];
  dialog = inject(MatDialog);
  showCustomerRecordEditForm: boolean = false
  chips = [{ key: 'onway', label: 'Onway Package' }, { key: 'rental', label: 'Rental Package' }, { key: 'customer', label: 'Customer Record' }, { key: 'enquiry', label: 'Customer Enquiry' }];
  selectedChip = this.chips[3];
  displayedEnquiryColumns: string[] = ['pickupLocation', 'DropLocationOrPackages', 'time', 'date', 'mobileNumber', 'delete'];
  enquiryDataSource = new MatTableDataSource<any>();
  displayedBookingDetailColumns: string[] = ['id', 'customerDetail', 'bookingDetail', 'actions'];
  displayedColumns: string[] = ['pickup', 'dropoff', 'price', 'sedanPrice', 'suvPrice', 'distance', 'active', 'actions'];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {

    this.priceForm = this.fb.group({
      pickup: ['', Validators.required],
      dropoff: ['', Validators.required],
      price: ['', Validators.required],
      sedanPrice: ['', Validators.required],
      suvPrice: ['', Validators.required],
      distance: ['', Validators.required],
      active: [false]
    });

    this.rentalForm = this.fb.group({
      time: ['', Validators.required],
      distance: ['', Validators.required],
      hatchbackPrice: ['', Validators.required],
      sedanPrice: ['', Validators.required],
      suvPrice: ['', Validators.required]
    });

    this.customerRecordEditForm = this.fb.group({
      customerDetail: this.fb.group({
        fullName: ['', Validators.required],
        pickupDate: ['', Validators.required],
        pickupTime: ['', Validators.required],
        pickupAddress: ['', Validators.required],
        numberOfPassengers: ['', [Validators.required, Validators.min(1)]],
        email: ['', [Validators.required, Validators.email]],
        mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Example for mobile number validation
      }),
      bookingDetail: this.fb.group({
        bookingType: ['', Validators.required],
        carType: ['', Validators.required],
        pickupLocation: ['', Validators.required],
        dropLocation: [''],
        price: ['', [Validators.required, Validators.min(0)]],
        distance: [''],
        waitingTime: [''],
        approxDistance: [''],
        package: [''],
      }),
    });

    this.filterOnwayTableFields = this.fb.group({
      filterData: ['']
    })

  }

  ngOnInit(): void {
    this.loadLocationPrices();
    this.loadRentalPackages();
    this.fetchCustomerRecords();
    this.loadEnquiryData();
    setTimeout(() => { this.showAllRecords() }, 1000)
  }

  //------------------------- One-Way Location and Prices Fields -------------------------------------------------   

  // To load one-way location and prices
  public loadLocationPrices(): void {
    this.locationService.getLocationPrices().subscribe({
      next: (prices) => {
        this.locationPrices = prices.reverse();
        this.filteredLocationPrices = this.locationPrices;
        this.filterOnwayTable()
      },
      error: (error) => {
        console.error('Error loading location prices:', error);
        this.snackBar.open('Failed to load location prices', 'Close', { duration: 3000 });
      }
    });
  }

  // Filter Onway Table Data Fields
  public filterOnwayTable(): void {
    this.filterOnwayTableFields
      .get('filterData')
      ?.valueChanges.subscribe((filterValue: string) => {
        this.filteredLocationPrices = this.locationPrices.filter((location) =>
          location.pickup.toLowerCase().includes(filterValue.toLowerCase())
        );
      });
  }

  // To add locations and cab prices
  public addLocationPrice(): void {
    const newPrice = this.priceForm.value;
    // Check if we are in edit mode
    if (this.editingId !== null && this.editingId !== undefined) {
      this.updateLocationPrice(newPrice);  // Update location
    } else {
      this.checkAndAddLocationPrice(newPrice);  // Add location (check for reverse)
    }
  }

  // To update one way locations and cab prices
  public updateLocationPrice(price: any): void {
    const locationPrice = {
      active: price.active,
      distance: price.distance,
      dropoff: price.dropoff,
      pickup: price.pickup,
      price: price.price,
      sedanPrice: price.sedanPrice,
      suvPrice: price.suvPrice,
    };

    this.locationService.updateLocationPrice(this.editingId, locationPrice).subscribe({
      next: () => {
        this.loadLocationPrices();
        this.snackBar.open("Location price updated successfully.", "Close", { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to update location price:', error);
        this.snackBar.open("Failed to update location price.", "Close", { duration: 3000 });
      }
    });
  }

  // Check for reverse entry and add location prices accordingly
  public checkAndAddLocationPrice(price: any): void {
    this.locationService.checkReverseLocation(price.pickup, price.dropoff).subscribe({
      next: (exists) => {
        if (exists) {
          this.snackBar.open("Reverse entry already exists. Only original entry will be added.", "Close", { duration: 3000 });
          this.addSingleLocationPrice(price);  // Add only the original entry
        } else {
          this.addOriginalAndReversePrices(price);  // Add both the original and reverse entries
        }
      },
      error: (error) => {
        console.error('Error checking for reverse entry:', error);
        this.snackBar.open("Error checking for reverse entry.", "Close", { duration: 3000 });
      }
    });
  }

  // Add only the original location price
  public addSingleLocationPrice(price: any): void {
    this.locationService.addLocationPrice(price).subscribe({
      next: () => {
        this.loadLocationPrices();  // Refresh list after adding
        this.clearPriceForm();      // Clear the form
        this.snackBar.open("Location price added successfully.", "Close", { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to add location price:', error);
        this.snackBar.open("Failed to add location price.", "Close", { duration: 3000 });
      }
    });
  }

  // Add both the original and reverse location prices
  public addOriginalAndReversePrices(price: any): void {
    // First, add the original location price
    this.locationService.addLocationPrice(price).subscribe({
      next: () => {
        // Create reverse price by swapping pickup and dropoff and generating a new ID
        const reversePrice = {
          ...price,
          id: this.generateRandomId(), // Ensure a unique ID for the reverse entry
          pickup: price.dropoff,
          dropoff: price.pickup,
        };

        // Add the reverse location price
        this.locationService.addLocationPrice(reversePrice).subscribe({
          next: () => {
            this.loadLocationPrices();  // Refresh the list after adding both prices
            this.clearPriceForm();      // Clear the form
            this.snackBar.open("Location price and reverse entry added successfully.", "Close", { duration: 3000 });
          },
          error: (error) => {
            console.error('Failed to add reverse location price:', error);
            this.snackBar.open("Failed to add reverse location price.", "Close", { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('Failed to add location price:', error);
        this.snackBar.open("Failed to add location price.", "Close", { duration: 3000 });
      }
    });
  }

  // Generate random id for adding fields
  public generateRandomId(): any {
    return Math.floor(Math.random() * 1000000); // Generate a random integer ID
  }

  // Edit an existing location price by setting the form values and editing ID
  public editLocationPrice(location: any): void {
    this.editingId = location.id;  // Set the editing ID
    this.priceForm.patchValue(location);  // Patch the values to the form
  }

  // Delete a location price and refresh the list upon success
  public deleteLocationPrice(id: any): void {
    this.locationService.deleteLocationPrice(id).subscribe({
      next: () => {
        this.loadLocationPrices();  // Refresh list after deletion
        this.snackBar.open('Location price deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting location price:', err);
        this.snackBar.open('Error deleting location price', 'Close', { duration: 3000 });
      }
    });
  }

  //---------------------------------- Rental Package Fields --------------------------------------------------- 

  // Load all records of rental package fields
  public loadRentalPackages(): void {
    this.locationService.getRentalPackages().subscribe({
      next: (data) => (this.localRentalPackages = data.reverse()),
      error: (err) => this.snackBar.open('Error loading rental packages', 'Close', { duration: 3000 })
    });
  }

  // Add rental package fields and prices
  public addRentalPackage(): void {
    if (this.rentalForm.invalid) {
      this.snackBar.open('Form is invalid', 'Close', { duration: 3000 });
      return;
    }
    let rentalData: any = this.rentalForm.value;
    if (this.editingRentalId) {
      this.locationService.updateRentalPackage(this.editingRentalId, rentalData).subscribe({
        next: () => {
          this.loadRentalPackages();
          this.clearRentalForm();
          this.snackBar.open('Rental package updated successfully', 'Close', { duration: 3000 });
        },
        error: (err) => this.snackBar.open('Error updating rental package', 'Close', { duration: 3000 })
      });
    } else {
      this.locationService.addRentalPackage(rentalData).subscribe({
        next: () => {
          this.loadRentalPackages();
          this.clearRentalForm();
          this.snackBar.open('Rental package added successfully', 'Close', { duration: 3000 });
        },
        error: (err) => this.snackBar.open('Error adding rental package', 'Close', { duration: 3000 })
      });
    }
  }

  //  Edit rental package fields and prices
  public editRentalPackage(rentalPackage: any): void {
    this.editingRentalId = rentalPackage.id;
    this.rentalForm.patchValue(rentalPackage);
  }

  // Delete rental package field
  public deleteRentalPackage(id: number): void {
    this.locationService.deleteRentalPackage(id).subscribe({
      next: () => {
        this.loadRentalPackages();
        this.snackBar.open('Rental package deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting rental package:', err.message);
        this.snackBar.open('Error deleting rental package', 'Close', { duration: 3000 });
      }
    });
  }

  //---------------------------------- Customer Record Fields ---------------------------------------------------  

  // Fetch all customer record entry
  public fetchCustomerRecords(): void {
    this.locationService.getCustomerRecord().subscribe((records) => {
      // Format pickup dates for display
      this.customerRecords = records.reverse().map(record => ({
        ...record,
        customerDetail: {
          ...record.customerDetail,
          pickupDate: record.customerDetail.pickupDate
            ? new Date(record.customerDetail.pickupDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            : 'N/A'
        }
      }));
    })
  };

  // Edit customer record entry and prices
  public editCustomer(record: any): void {
    this.showCustomerRecordEditForm = true;
    this.editingId = record.id; // Store the ID for save functionality
    // Format the pickup date, handling undefined cases
    const pickupDate = record.customerDetail?.pickupDate
      ? new Date(record.customerDetail.pickupDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      : 'N/A';

    // Populate the form with customer details
    this.customerRecordEditForm.patchValue({
      customerDetail: {
        fullName: record.customerDetail?.fullName,
        pickupDate: record.customerDetail?.pickupDate, // Keep original date for saving
        pickupTime: record.customerDetail?.pickupTime,
        pickupAddress: record.customerDetail?.pickupAddress,
        numberOfPassengers: record.customerDetail?.numberOfPassengers,
        email: record.customerDetail?.email,
        mobileNumber: record.customerDetail?.mobileNumber,
      },
      bookingDetail: {
        bookingType: record.bookingDetail?.bookingType,
        carType: record.bookingDetail?.carType,
        pickupLocation: record.bookingDetail?.pickupLocation,
        dropLocation: record.bookingDetail?.dropLocation,
        price: record.bookingDetail?.price,
        distance: record.bookingDetail?.distance,
        waitingTime: record.bookingDetail?.waitingTime,
        approxDistance: record.bookingDetail?.approxDistance,
        package: record.bookingDetail?.package
      }
    });
  }

  // Show customer record by selected date 
  public filterByDate(date: any): void {
    if (date) {
      const selectedDate = new Date(date).toLocaleDateString("en-US");
      this.filteredRecords = this.customerRecords.filter((record: any) => {
        const recordPickupDate = new Date(record.customerDetail.pickupDate).toLocaleDateString("en-US");
        return recordPickupDate === selectedDate;
      });
      // Show snackbar if no records are found for the selected date
      if (this.filteredRecords.length === 0) {
        this.snackBar.open('No records found for the selected date', 'Close', {
          duration: 3000, // Snackbar display duration in milliseconds
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    } else {
      // If no date is selected, reset to show all records
      this.showAllRecords();
    }
  }

  // Reset to show all records
  public showAllRecords(): void {
    this.fetchCustomerRecords();
    this.filteredRecords = [...this.customerRecords];
  }

  // Save edited customer record entry
  public saveEdit(): void {
    if (this.customerRecordEditForm.valid && this.editingId) {
      const updatedData = this.customerRecordEditForm.value;

      // Format the pickup date to a string format before saving
      if (updatedData.customerDetail.pickupDate) {
        updatedData.customerDetail.pickupDate = new Date(updatedData.customerDetail.pickupDate).toISOString();
      }

      this.locationService.editCustomerRecord(this.editingId, updatedData).subscribe(
        () => {
          this.snackBar.open('Customer record updated successfully!', 'Close', { duration: 2000 });
          this.showCustomerRecordEditForm = false;

          // Update the specific record in `customerRecords` locally
          const recordIndex = this.customerRecords.findIndex(record => record.id === this.editingId);
          if (recordIndex !== -1) {
            this.customerRecords[recordIndex] = { id: this.editingId, ...updatedData };
          }

          this.editingId = null; // Reset editing ID
          document.location.reload();
        },
        (error) => {
          console.error('Error updating customer record:', error);
          this.snackBar.open('Error updating record. Please try again.', 'Close', { duration: 2000 });
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  // Delete customer record entry
  public deleteCustomer(id: any): void {
    const dialogRef = this.dialog.open(ConfirmCustomerRecordDeleteComponent, {
      width: '400px',
      data: { id }, // Pass the customer ID as data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If confirmed, proceed with deletion
        this.locationService.deleteCustomerRecord(id).subscribe(() => {
          this.customerRecords = this.customerRecords.filter((record) => record.id !== id);
          this.fetchCustomerRecords();
          this.snackBar.open('Customer record deleted successfully!', 'Close', { duration: 2000 });
        });
      } else {
        this.snackBar.open('Deletion cancelled', 'Close', { duration: 2000 });
      }
    });
  }

  // Download the pdf
  public downloadRecord(recordId: any): void {
    const record = this.customerRecords.find(r => r.id === recordId);

    if (record) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Header Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text('KITECAB', 10, 15);

      doc.setFont("helvetica", "light");
      doc.setFontSize(10);
      doc.text('Your Way, Our Goal', 10, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text('Contact: +916263676216 | Website: www.kitecab.com', 10, 25);
      doc.text('Address: Kandul Road, Sejbahar, Kamal Vihar, Raipur (C.G)', 10, 30);

      // Invoice Title & Date
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text('INVOICE', 105, 40, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 160, 40);

      // Separator Line
      doc.setLineWidth(0.5);
      doc.line(10, 45, 200, 45);

      // Table-Like Layout for Details
      const details = [
        ['Full Name', record.customerDetail.fullName],
        ['Mobile', record.customerDetail.mobileNumber],
        ['Email', record.customerDetail.email],
        ['Pickup Date & Time', `${record.customerDetail.pickupDate} | ${record.customerDetail.pickupTime}`],
        ['Pickup Address', record.customerDetail.pickupAddress],
        ['Booking Type', record.bookingDetail.bookingType],
        ['Car Type', record.bookingDetail.carType],
        ['Pickup Location', record.bookingDetail.pickupLocation],
        ['Drop Location', record.bookingDetail.dropLocation || 'N/A'],
        ['Distance', `${record.bookingDetail.distance} km`],
        ['Waiting Time', `${record.bookingDetail.waitingTime || 'N/A'} min`],
        ['Approx Distance', `${record.bookingDetail.approxDistance || 'N/A'} km`],
        ['Package', record.bookingDetail.package || 'N/A'],
      ];

      let startY = 50;

      details.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 10, startY);
        doc.setFont("helvetica", "normal");
        doc.text(value, 60, startY);
        startY += 7;
      });

      // Highlight Total Price with Underline
      startY += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Total Price: ${record.bookingDetail.price} Rupee`, 10, startY);
      doc.setLineWidth(0.5);
      doc.line(10, startY + 1, 80, startY + 1); // Underline for price

      // Footer Section - Compact
      startY += 10;
      doc.setLineWidth(0.5);
      doc.line(10, startY, 200, startY); // Footer Separator Line
      startY += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text('Thank you for choosing KiteCab!', 105, startY, { align: 'center' });
      startY += 5;
      doc.text('For inquiries, visit our website or contact support@kitecab.com.', 105, startY, { align: 'center' });

      // Save the PDF
      doc.save(`${record.customerDetail.fullName}-KiteCab-Receipt.pdf`);
    } else {
      console.error('Record not found for downloading');
    }
  }

  //---------------------------------- Customer Enquiry Filed ---------------------------------------------------   

  // Load all customer enquiry data 
  public loadEnquiryData(): void {
    this.locationService.getEnquiryRecord().subscribe({
      next: (data) => {
        this.enquiryDataSource.data = data.reverse();
      },
      error: (err) => console.error('Error fetching enquiry records:', err)
    });
  }

  // Delete customer enquiry field
  public deleteEnquiry(id: string): void {
    this.locationService.deleteEnquiryRecord(id).subscribe(
      (response) => {
        this.snackBar.open('Enquiry deleted successfully', "DISMISS", { duration: 3000 });
        // Filter the deleted item from the data source
        this.enquiryDataSource.data = this.enquiryDataSource.data.filter((enquiry) => enquiry.id !== id);

      },
      (error) => console.error('Error deleting enquiry', error)
    );
  }

  //---------------------------------- Other Fields --------------------------------------------------- 

  // Refresh the page
  public reloadPage(): void {
    window.location.reload()
  }

  private clearPriceForm(): void {
    this.priceForm.reset();
    this.editingId = null;
  }

  private clearRentalForm(): void {
    this.rentalForm.reset();
    this.editingRentalId = null;
  }

  public selectChip(chip: any): void {
    this.selectedChip = chip;
  }

  public adminLogout(): void {
    this.authService.logout()
  }
}

