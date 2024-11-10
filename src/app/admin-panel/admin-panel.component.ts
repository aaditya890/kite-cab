import { Component, OnInit } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AuthService } from '../auth.service';
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
  locationPrices: any[] = [];
  localRentalPackages: any[] = [];
  editingId: any;
  editingRentalId: number | null = null;
  id: string | undefined;
  customerRecordEditForm!: FormGroup;
  customerRecords: any[] = [];
  filteredRecords = [...this.customerRecords];
  showCustomerRecordEditForm: boolean = false
  chips = [
    { key: 'onway', label: 'Onway Package' },
    { key: 'rental', label: 'Rental Package' },
    { key: 'customer', label: 'Customer Record' },
    { key: 'enquiry', label: 'Customer Enquiry' }
  ];
  selectedChip = this.chips[2];
  displayedEnquiryColumns: string[] = ['pickupLocation', 'DropLocationOrPackages', 'mobileNumber', 'delete'];
  enquiryDataSource = new MatTableDataSource<any>();
  displayedBookingDetailColumns: string[] = ['id', 'customerDetail', 'bookingDetail', 'actions'];
  displayedColumns: string[] = [
    'pickup', 'dropoff', 'price', 'sedanPrice', 'suvPrice', 'distance', 'active', 'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private snackBar: MatSnackBar,
    private authService:AuthService
  ) {
    this.priceForm = this.fb.group({
      pickup: ['', Validators.required],
      dropoff: ['', Validators.required],
      price: ['', Validators.required],
      sedanPrice: ['', Validators.required],
      suvPrice: ['', Validators.required],
      distance: ['', Validators.required],
      active: [true]
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

  }

  ngOnInit(): void {
    this.loadLocationPrices();
    this.loadRentalPackages();
    this.fetchCustomerRecords();
    this.showAllRecords();
    this.loadEnquiryData();
  }

  loadLocationPrices(): void {
    this.locationService.getLocationPrices().subscribe({
      next: (data: any) => (this.locationPrices = data),
      error: (err) => this.snackBar.open('Error loading location prices', 'Close', { duration: 3000 })
    });
  }

  loadRentalPackages(): void {
    this.locationService.getRentalPackages().subscribe({
      next: (data) => (this.localRentalPackages = data),
      error: (err) => this.snackBar.open('Error loading rental packages', 'Close', { duration: 3000 })
    });
  }

  addLocationPrice(): void {
    const newPrice = this.priceForm.value;
    // Check if in edit mode
    if (this.editingId !== null && this.editingId !== undefined) {
      this.updateLocationPrice(newPrice);  // Call helper function to handle update
    } else {
      this.checkAndAddLocationPrice(newPrice);  // Call helper function to handle adding
    }
  }

  // Helper function to update an existing location price
  private updateLocationPrice(price: any): void {
    this.locationService.updateLocationPrice(this.editingId, price).subscribe({
      next: () => {
        this.loadLocationPrices();         // Refresh list after updating
        this.clearPriceForm();              // Clear the form after submission
        this.snackBar.open("Location price updated successfully.", "Close", { duration: 3000 });
        this.editingId = null;              // Exit edit mode
      },
      error: (error) => {
        console.error('Failed to update location price:', error);
        this.snackBar.open("Failed to update location price.", "Close", { duration: 3000 });
      }
    });
  }

  // Helper function to check for reverse entry and add location prices accordingly
  private checkAndAddLocationPrice(price: any): void {
    this.locationService.checkReverseLocation(price.pickup, price.dropoff).subscribe({
      next: (exists) => {
        if (exists) {
          this.snackBar.open("Reverse entry already exists. Only original entry will be added.", "Close", { duration: 3000 });
          this.addSingleLocationPrice(price);  // Add the original price only
        } else {
          this.addOriginalAndReversePrices(price);  // Add both original and reverse entries
        }
      },
      error: (error) => {
        console.error('Error checking for reverse entry:', error);
        this.snackBar.open("Error checking for reverse entry.", "Close", { duration: 3000 });
      }
    });
  }

  // Helper function to add only the original location price
  private addSingleLocationPrice(price: any): void {
    this.locationService.addLocationPrice(price).subscribe({
      next: () => {
        this.loadLocationPrices();
        this.clearPriceForm();
        this.snackBar.open("Location price added successfully.", "Close", { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to add location price:', error);
        this.snackBar.open("Failed to add location price.", "Close", { duration: 3000 });
      }
    });
  }

  // Helper function to add both original and reverse location prices
  private addOriginalAndReversePrices(price: any): void {
    this.locationService.addLocationPrice(price).subscribe({
      next: () => {
        const reversePrice = { ...price, pickup: price.dropoff, dropoff: price.pickup };

        this.locationService.addLocationPrice(reversePrice).subscribe({
          next: () => {
            this.loadLocationPrices();
            this.clearPriceForm();
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

  // Method to edit a location price by setting the form values and editing ID
  editLocationPrice(location: any): void {
    this.editingId = location.id;
    this.priceForm.patchValue(location);
  }

  // Method to delete a location price and refresh the list upon success
  deleteLocationPrice(id: number): void {
    this.locationService.deleteLocationPrice(id).subscribe({
      next: () => {
        this.loadLocationPrices();
        this.snackBar.open('Location price deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting location price:', err);
        this.snackBar.open('Error deleting location price', 'Close', { duration: 3000 });
      }
    });
  }

  addRentalPackage(): void {
    if (this.rentalForm.invalid) {
      this.snackBar.open('Form is invalid', 'Close', { duration: 3000 });
      return;
    }
    const rentalData = this.rentalForm.value;
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

  editRentalPackage(rentalPackage: any): void {
    this.editingRentalId = rentalPackage.id;
    this.rentalForm.patchValue(rentalPackage);
  }

  deleteRentalPackage(id: number): void {
    this.locationService.deleteRentalPackage(id).subscribe({
      next: () => {
        this.loadRentalPackages();
        this.snackBar.open('Rental package deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => this.snackBar.open('Error deleting rental package', 'Close', { duration: 3000 })
    });
  }

  fetchCustomerRecords(): void {
    this.locationService.getCustomerRecord().subscribe((records) => {
      // Format pickup dates for display
      this.customerRecords = records.map(record => ({
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

  // Edit customer record
  editCustomer(record: any): void {
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

  filterByDate(date: any) {
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
  showAllRecords() {
    this.fetchCustomerRecords();
    this.filteredRecords = [...this.customerRecords];
  }

  // Save edited customer record
  saveEdit(): void {
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

  // Delete customer record
  deleteCustomer(id: string): void {
    this.locationService.deleteCustomerRecord(id).subscribe(() => {
      this.customerRecords = this.customerRecords.filter(record => record.id !== id);
      this.snackBar.open('Customer record deleted successfully!', 'Close', { duration: 2000 });
    });
  }

  // Download customer record as a PDF
  downloadRecord(recordId: string): void {
    const record = this.customerRecords.find(r => r.id === recordId);

    if (record) {
      const doc = new jsPDF();

      // Set up document metadata
      doc.setProperties({
        title: `${record.customerDetail.fullName}'s Booking Record - KiteCab`
      });

      // Header section with company name and logo
      doc.setFontSize(18);
      doc.text('KiteCab - Customer Booking Record', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Reliable Cab Service', 105, 22, { align: 'center' });

      // Adding a separator line below the header
      doc.setLineWidth(0.5);
      doc.line(10, 25, 200, 25);

      // Space before customer details
      doc.setFontSize(12);
      doc.text(`${record.customerDetail.fullName}'s Booking Details`, 14, 35);

      // Define the body data for the table, with special styling for the "Price" row
      const bodyData = [
        ['Full Name', record.customerDetail.fullName],
        ['Pickup Date', record.customerDetail.pickupDate],
        ['Pickup Time', record.customerDetail.pickupTime],
        ['Pickup Address', record.customerDetail.pickupAddress],
        ['Number of Passengers', record.customerDetail.numberOfPassengers],
        ['Email', record.customerDetail.email],
        ['Mobile Number', record.customerDetail.mobileNumber],
        ['Booking Type', record.bookingDetail.bookingType],
        ['Car Type', record.bookingDetail.carType],
        ['Pickup Location', record.bookingDetail.pickupLocation],
        ['Drop Location', record.bookingDetail.dropLocation || 'N/A'],
        [
          'Price',
          `${record.bookingDetail.price} Rupee`,
          { textColor: [255, 0, 0], fontStyle: 'bold', fillColor: [200, 255, 200] } // Medium highlight: red text, bold, light gray background
        ],
        ['Distance', `${record.bookingDetail.distance} km`],
        ['Waiting Time', `${record.bookingDetail.waitingTime || 'N/A'} minutes`],
        ['Approx Distance', `${record.bookingDetail.approxDistance || 'N/A'} km`],
        ['Package', record.bookingDetail.package || 'N/A']
      ];

      // AutoTable with styling and custom row highlight for Price
      autoTable(doc, {
        startY: 40,
        headStyles: { fillColor: [0, 123, 255] }, // Blue color for header background
        styles: { fontSize: 10, cellPadding: 3 }, // Smaller font and padding for table cells
        head: [['Field', 'Details']],
        body: bodyData,
        didParseCell: (data) => {
          // Check if this is the "Price" row and apply custom style
          if (data.cell.raw === `${record.bookingDetail.price} Rupee`) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [255, 0, 0]; // Red color text
            data.cell.styles.fillColor = [240, 240, 240]; // Light gray background
          }
        },
        theme: 'striped'
      });

      // Footer with company contact information
      doc.setFontSize(10);
      doc.text('Thank you for choosing KiteCab!', 105, doc.internal.pageSize.height - 20, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Contact Us: +916263676216 | kitecab00@gmail.com', 105, doc.internal.pageSize.height - 10, { align: 'center' });
      // Save the PDF
      doc.save(`${record.customerDetail.fullName}-KiteCab-Booking.pdf`);
    } else {
      console.error('Record not found for downloading');
    }
  }

  loadEnquiryData(): void {
    this.locationService.getEnquiryRecord().subscribe({
      next: (data) => {
        this.enquiryDataSource.data = data;
      },
      error: (err) => console.error('Error fetching enquiry records:', err)
    });
  }

  deleteEnquiry(id: string): void {
    this.locationService.deleteEnquiryRecord(id).subscribe(
      (response) => {
        this.snackBar.open('Enquiry deleted successfully', "DISMISS", {
          duration: 3000
        });
        const data = this.enquiryDataSource.data.filter((enquiry) => enquiry.id !== id);
        this.enquiryDataSource.data = data;
      },
      (error) => console.error('Error deleting enquiry', error)
    );
  }

  private clearPriceForm(): void {
    this.priceForm.reset();
    this.editingId = null;
  }

  private clearRentalForm(): void {
    this.rentalForm.reset();
    this.editingRentalId = null;
  }

  selectChip(chip: any) {
    this.selectedChip = chip;
  }

  adminLogout(){
    this.authService.logout()
  }
}

