import { Injectable, NgZone } from '@angular/core';
import { AuthChangeEvent, AuthSession, createClient, Session, SupabaseClient, User, } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}
export interface LocationPrice {
  id: string;
  pickup: string;
  dropoff: string;
  price: number;
  sedanPrice: number;
  suvPrice: number;
  distance: number;
  active: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  _session: AuthSession | null = null;

  constructor(private ngZone: NgZone) { }

  // Initialize the Supabase client
  async initialize() {
    this.supabase = this.ngZone.runOutsideAngular(() =>
      createClient(environment.supabaseUrl, environment.supabaseKey)
    );
    return this.supabase;
  }

  // Fetch data by key
  async getDataByKey(key: string) {
    if (!this.supabase) await this.initialize();
    const { data, error } = await this.supabase
      .from('kitecab')
      .select('*')
      .eq('key', key);

    if (error) {
      console.error('Error fetching data:', error.message, error.details);
      return [];
    }

    return (data[0] as any).value || [];
  }

  // Add or update data by key (add or update locationPrices)
  async addOrUpdateDataByKey(key: string, newValue: any) {
    if (!this.supabase) await this.initialize();

    // Ensure newValue is always an array
    const valueArray = Array.isArray(newValue) ? newValue : [newValue];

    // Fetch the existing record by key
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('*')
      .eq('key', key)
      .single();

    if (fetchError) {
      console.error('Error fetching existing data:', fetchError.message);
      return null;
    }

    let result;
    if (existingData) {
      // Update the existing record with the new value (append new values)
      const { data, error: updateError } = await this.supabase
        .from('kitecab')
        .update({ value: [...existingData.value, ...valueArray] }) // Append to the existing value array
        .eq('id', existingData.id);

      if (updateError) {
        console.error('Error updating data:', updateError.message);
        return null;
      }
      result = data;
    } else {
      // Insert a new record if no existing record with the key
      const { data, error: insertError } = await this.supabase
        .from('kitecab')
        .insert([{ key, value: valueArray }]); // Insert new location prices as an array

      if (insertError) {
        console.error('Error adding data:', insertError.message);
        return null;
      }
      result = data;
    }

    return result;
  }

  // update data by given id
  async updateDataById(id: number, updatedValues: any) {
    if (!this.supabase) await this.initialize();

    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'locationPrices')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching data for update:', fetchError.message);
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      console.error('No valid data found for "locationPrices" or data is not an array');
      return null;
    }

    const currentValue = existingData.value;


    const itemIndex = currentValue.findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      console.warn(`No matching entry found for ID: ${id}`);
      return null;
    }

    currentValue[itemIndex] = { ...currentValue[itemIndex], ...updatedValues };

    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: currentValue })
      .eq('key', 'locationPrices');

    if (updateError) {
      return null;
    }

    return data;
  }

  // Delete data by give id
  async deleteDataById(objectToRemove: any, id: any) {
    objectToRemove =
    {
      id: id,
      price: 0,
      active: true,
      pickup: "",
      dropoff: "",
      distance: 0,
      suvPrice: 0,
      sedanPrice: 0
    }
    if (!this.supabase) await this.initialize();

    // Step 1: Fetch the existing data for 'locationPrices'
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'locationPrices')
      .maybeSingle();

    if (fetchError) {
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      return null;
    }

    const currentValue = existingData.value;

    if (!objectToRemove || !objectToRemove.id) {
      return null;
    }

    const updatedValue = currentValue.filter((item: any) => item.id !== objectToRemove.id);


    if (updatedValue.length === currentValue.length) {
      console.warn('No matching entry found for deletion.');
      return null;
    }

    // Step 4: Update the JSONB field in Supabase with the updated array
    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: updatedValue })
      .eq('key', 'locationPrices');


    return data;
  }

  // Update rental package field
  async updateRentalPackageById(id: number, updatedValues: any) {
    if (!this.supabase) await this.initialize();

    // Fetch the existing rentalPackages data
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'rentalPackages')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching rentalPackages data for update:', fetchError.message);
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      console.error('No valid data found for "rentalPackages" or data is not an array');
      return null;
    }

    const currentPackages = existingData.value;

    // Find the index of the rental package to update
    const packageIndex = currentPackages.findIndex((pkg: any) => pkg.id === id);

    if (packageIndex === -1) {
      console.warn(`No matching rental package found for ID: ${id}`);
      return null;
    }

    // Update the specified package with new values
    currentPackages[packageIndex] = { ...currentPackages[packageIndex], ...updatedValues };

    // Update the JSONB field in Supabase with the updated rentalPackages array
    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: currentPackages })
      .eq('key', 'rentalPackages');

    if (updateError) {
      console.error('Error updating rental package data:', updateError.message);
      return null;
    }

    return data;
  }

  // Delete rental package field
  async deleteRentalPackage(objectToRemove: any, id: number) {
    if (!this.supabase) await this.initialize();

    // Fetch the existing data for 'rentalPackages'
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'rentalPackages')
      .maybeSingle();

    if (fetchError) {
      // console.error('Error fetching rental packages for deletion:', fetchError.message);
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      // console.error('Invalid data format for "rentalPackages" or data is not an array');
      return null;
    }

    const currentValue = existingData.value;

    // Remove the package with the specified ID
    const updatedValue = currentValue.filter((item: any) => item.id !== objectToRemove.id);

    if (updatedValue.length === currentValue.length) {
      // console.warn('No matching entry found for deletion.');
      return null;
    }

    // Update the JSONB field in Supabase with the updated array
    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: updatedValue })
      .eq('key', 'rentalPackages');

    if (updateError) {
      // console.error('Error updating rental packages after deletion:', updateError.message);
      return null;
    }

    // console.log('Rental packages successfully updated:', data);
    return data;
  }

  // Delete customer record field 
  async deleteCustomerRecord(id: number) {
    if (!this.supabase) await this.initialize();

    // Step 1: Fetch the existing data for 'customerRecords'
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'customersRecord') // assuming key is 'customerRecords'
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching customer records for deletion:', fetchError.message);
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      console.error('No valid data found for "customerRecords" or data is not an array');
      return null;
    }

    const currentValue = existingData.value;

    // Step 2: Remove the customer record matching the specified ID
    const updatedValue = currentValue.filter((record: any) => record.id !== id);

    // Log updated value to ensure the item has been removed
    // console.log('Updated customerRecords after deletion:', updatedValue);

    // Check if the item was actually removed
    if (updatedValue.length === currentValue.length) {
      console.warn('No matching customer record found for deletion.');
      return null;
    }

    // Step 3: Update the JSONB field in Supabase with the updated array
    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: updatedValue })
      .eq('key', 'customersRecord');

    if (updateError) {
      console.error('Error updating customer records after deletion:', updateError.message);
      return null;
    }

    console.log('Customer records successfully updated:', data);
    return data;
  }

  // Update the customer record field
  async updateCustomerRecord(id: number, updatedValues: any) {
    if (!this.supabase) await this.initialize();

    // Fetch the existing rentalPackages data
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'customersRecord')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching rentalPackages data for update:', fetchError.message);
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      console.error('No valid data found for "rentalPackages" or data is not an array');
      return null;
    }

    const currentPackages = existingData.value;

    // Find the index of the rental package to update
    const packageIndex = currentPackages.findIndex((pkg: any) => pkg.id === id);

    if (packageIndex === -1) {
      console.warn(`No matching rental package found for ID: ${id}`);
      return null;
    }

    // Update the specified package with new values
    currentPackages[packageIndex] = { ...currentPackages[packageIndex], ...updatedValues };

    // Update the JSONB field in Supabase with the updated rentalPackages array
    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: currentPackages })
      .eq('key', 'customersRecord');

    if (updateError) {
      console.error('Error updating rental package data:', updateError.message);
      return null;
    }

    return data;
  }

  // Delete customer enquiry field
  async deleteEnquiryRecord(id: number) {
    if (!this.supabase) await this.initialize();

    // Step 1: Fetch the existing data for 'enquiry'
    const { data: existingData, error: fetchError } = await this.supabase
      .from('kitecab')
      .select('value')
      .eq('key', 'enquiry')  // Ensure key is correct
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching enquiry records for deletion:', fetchError.message);
      return null;
    }

    if (!existingData || !Array.isArray(existingData.value)) {
      console.error('No valid data found for "enquiry" or data is not an array');
      return null;
    }

    const currentValue = existingData.value;

    // Step 2: Remove the enquiry record matching the specified ID
    const updatedValue = currentValue.filter((record: any) => record.id !== id);

    // Log updated value to ensure the item has been removed
    console.log('Updated enquiry records after deletion:', updatedValue);

    // Check if the item was actually removed
    if (updatedValue.length === currentValue.length) {
      console.warn('No matching enquiry record found for deletion.');
      return null;
    }

    // Step 3: Update the JSONB field in Supabase with the updated array
    const { data, error: updateError } = await this.supabase
      .from('kitecab')
      .update({ value: updatedValue })
      .eq('key', 'enquiry');

    if (updateError) {
      console.error('Error updating enquiry records after deletion:', updateError.message);
      return null;
    }

    console.log('Enquiry records successfully updated:', data);
    return data;
  }
}
