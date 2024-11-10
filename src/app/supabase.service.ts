import { Injectable, NgZone } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase!: SupabaseClient
  _session: AuthSession | null = null

  constructor(
    private ngZone: NgZone
  ) {
    
  }

  async initialize() {
    this.supabase = this.ngZone.runOutsideAngular(() =>
      createClient(environment.supabaseUrl, environment.supabaseKey)
    );
    return this.supabase;
  }

  

  async getDataByKey(key: string) {
    if(!this.supabase) {
      await this.initialize();
    }
    const { data, error } = await this.supabase
      .from('kitecab')
      .select('')
      .eq('key', key);

    if (error) {
      console.error('Error fetching kitecab data:', error.message, error.details);
      return [];
    }

    console.log(`Data for ${key}:`, data);
    return (data[0] as any).value || [];
  }

}
