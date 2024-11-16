import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private supabase: SupabaseService,private http:HttpClient) { }

  // Fetch all onway location prices from the database
  getLocationPrices(): Observable<any[]> {
    return new Observable((observer) => {
      this.supabase.getDataByKey('locationPrices')
        .then((res: any) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Add a new onway location price to the database with a random integer ID if it doesn't already have one
  addLocationPrice(locationPrice: any): Observable<any> {
    return new Observable((observer) => {
      // Check if the locationPrice object has an id property; if not, generate a random integer ID
      if (!locationPrice.id) {
        locationPrice.id = this.generateRandomId();
      }

      this.supabase.addOrUpdateDataByKey('locationPrices', locationPrice)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Update onway location and price fields
  updateLocationPrice(id: number, locationPrice: any): Observable<any> {
    return new Observable((observer: any) => {
      this.supabase.updateDataById(id, locationPrice)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Delete onway location and price fields
  deleteLocationPrice(id: any): Observable<any> {
    let selectedObj: any;
    this.getLocationPrices().subscribe({
      next: (prices: any) => {
        selectedObj = prices.find((res: any) => res.id == id);
      },
      error: (error) => {
        console.error('Error loading location prices:', error);
      }
    });
    return new Observable((observer) => {
      this.supabase.deleteDataById(selectedObj, id)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Generate random id for fields
  generateRandomId(): number {
    return Math.floor(Math.random() * 1000000);  // Generate a random integer ID
  }

  //Get Rental Packages data
  getRentalPackages(): Observable<any[]> {
    return new Observable((observer) => {
      this.supabase.getDataByKey('rentalPackages')
        .then((res: any) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  //Add Rental Packages field
  addRentalPackage(rentalPackage: any): Observable<any> {
    return new Observable((observer) => {
      // Check if the locationPrice object has an id property; if not, generate a random integer ID
      if (!rentalPackage.id) {
        rentalPackage.id = this.generateRandomId();
      }
      this.supabase.addOrUpdateDataByKey('rentalPackages', rentalPackage)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  //Update Rental Packages field
  updateRentalPackage(id: number, rentalPackage: any): Observable<any> {
    return new Observable((observer: any) => {
      this.supabase.updateRentalPackageById(id, rentalPackage)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Delete Rental Packages field 
  deleteRentalPackage(id: number): Observable<any> {
    return new Observable((observer) => {
      // Fetch rental packages to locate the package by ID
      this.getRentalPackages().subscribe({
        next: (packages: any) => {
          const selectedObj = packages.find((pkg: any) => pkg.id === id);

          if (!selectedObj) {
            observer.error(new Error('Rental package not found for the given ID'));
            return;
          }

          // Call the Supabase service to delete the package
          this.supabase.deleteRentalPackage(selectedObj, id)
            .then((res: any) => {
              observer.next(res);
              observer.complete();
            })
            .catch((error: any) => {
              observer.error(error);
            });
        },
        error: (error) => {
          console.error('Error loading rental packages:', error);
          observer.error(error);
        }
      });
    });
  }

  // Check if reverse location entry exists
  checkReverseLocation(pickup: string, dropoff: string): Observable<boolean> {
    return this.getLocationPrices().pipe(
      map((prices) =>
        prices.some(
          (price) => price.pickup === dropoff && price.dropoff === pickup
        )
      )
    );
  }

  // Selected nav link field and move this section
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Get customer record data
  getCustomerRecord(): Observable<any[]> {
    return new Observable((observer) => {
      this.supabase.getDataByKey('customersRecord')
        .then((res: any) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Add customer record data
  addCustomerRecord(customerData: { customerDetail: any; bookingDetail?: any }): Observable<any> {
    const payload: any = {
      customerDetail: customerData.customerDetail,
      bookingDetail: customerData.bookingDetail || null,
    };
    return new Observable((observer) => {
      // Check if the locationPrice object has an id property; if not, generate a random integer ID
      if (!payload.id) {
        payload.id = this.generateRandomId();
      }

      this.supabase.addOrUpdateDataByKey('customersRecord', payload)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

   // Edit customer record data
  editCustomerRecord(id: any, updatedData: any): Observable<any> {
    return new Observable((observer: any) => {
      this.supabase.updateCustomerRecord(id, updatedData)
        .then((res: any) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

   // Delete customer record data
  deleteCustomerRecord(id: any): Observable<any> {
    return new Observable((observer) => {
      // Fetch rental packages to locate the package by ID
      this.getCustomerRecord().subscribe({
        next: (customer: any) => {
          const selectedObj = customer.find((cus: any) => cus.id == id);
          if (!selectedObj) {
            observer.error(new Error('Customer not found for the given ID'));
            return;
          }

          // Call the Supabase service to delete the package
          this.supabase.deleteCustomerRecord(id)
            .then((res: any) => {
              observer.next(res);
              observer.complete();
            })
            .catch((error: any) => {
              observer.error(error);
            });
        },
        error: (error) => {
          console.error('Error loading customer record:', error);
          observer.error(error);
        }
      });
    });
  }

  // Add customer enquiry data
  setEnquiryRecord(enquiryData: any): Observable<any> {
    return new Observable((observer) => {
      if (!enquiryData.id) {
        enquiryData.id = this.generateRandomId();
      }
      this.supabase.addOrUpdateDataByKey('enquiry', enquiryData)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Get customer enquiry data
  getEnquiryRecord(): Observable<any[]> {
    return new Observable((observer) => {
      this.supabase.getDataByKey('enquiry')
        .then((res: any) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Delete customer enquiry field
  deleteEnquiryRecord(id: any): Observable<any> {
    return new Observable((observer) => {
      // Call the Supabase service to delete the enquiry record
      this.supabase.deleteEnquiryRecord(id)
        .then((res: any) => {
          if (res) {
            observer.next(res);
            observer.complete();
          } else {
            observer.error(new Error('Enquiry record not found or could not be deleted'));
          }
        })
        .catch((error: any) => {
          console.error('Error deleting enquiry record:', error);
          observer.error(error);
        });
    });
  }

}

