import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000'; // Replace with your actual API URL
  constructor(private http: HttpClient,) { }

  // Location Prices
  getLocationPrices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locationPrices`);
  }

  addLocationPrice(locationPrice: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/locationPrices`, locationPrice);
  }

  updateLocationPrice(id: number, locationPrice: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/locationPrices/${id}`, locationPrice);
  }

  deleteLocationPrice(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/locationPrices/${id}`);
  }

  // Rental Packages
  getRentalPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rentalPackages`);
  }

  addRentalPackage(rentalPackage: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rentalPackages`, rentalPackage);
  }

  updateRentalPackage(id: number, rentalPackage: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/rentalPackages/${id}`, rentalPackage);
  }

  deleteRentalPackage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/rentalPackages/${id}`);
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

  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  addCustomerRecord(customerData: { customerDetail: any; bookingDetail?: any }): Observable<any> {
    const payload = {
      customerDetail: customerData.customerDetail,
      bookingDetail: customerData.bookingDetail || null,
    };
    return this.http.post<any>(`${this.apiUrl}/customersRecord`, payload);
  }

  getCustomerRecord(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customersRecord`);
  }

  editCustomerRecord(id: string, updatedData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/customersRecord/${id}`, updatedData);
  }

  deleteCustomerRecord(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/customersRecord/${id}`);
  }
}

