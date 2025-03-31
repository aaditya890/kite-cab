import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { LocationService } from '../location.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterLink, MatIconModule, MatDialogModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  services = [
    {
      title: 'Roundtrip Cabs',
      description: 'Our premium roundtrip services will pamper you with an absolutely comfortable drive from your doorstep & back. Our chauffeurs are courteous and expert travel companions.',
      icon: 'directions_car',
      image: 'assets/images/roundtrip.jpg',
      features: ['Expert Chauffeurs', 'Safety Certified', 'Multiple Stops']
    },
    {
      title: 'Oneway Drops',
      description: 'Our network of over 15 lakh one way routes ensures that there is no corner of the country that you can’t travel with us. Pay only one side charge at rock bottom rates.',
      icon: 'swap_horiz',
      image: 'assets/images/oneway.jpg',
      features: ['15 Lakh Routes', 'Lowest Fares', 'All Inclusive Prices']
    },
    {
      title: 'Local Rentals',
      description: 'Book our flexible hourly rental cabs and get chauffeured within the city for your business meetings or shopping chores. Explore your city like a local.',
      icon: 'location_city',
      image: 'assets/images/local.jpg',
      features: ['Flexible Packages', 'Cab At Your Disposal', 'Multiple Stops']
    },
    {
      title: 'Airport Transfers',
      description: 'We care about your flight as much as you do. Our airport transfer services offer pickups and drops with complete reliability. Book in advance and rest easy.',
      icon: 'flight_takeoff',
      image: 'assets/images/airport.jpg',
      features: ['Reliability Guaranteed', 'Lowest Fares', 'Courteous Chauffeurs']
    }
  ];
  isMenuOpen = false;
  constructor(private locationService: LocationService, public dialog: MatDialog) { }

  public openLoginDialog(key: string): void {
    this.dialog.open(LoginComponent, {
      data: {
        key: key
      }
    })
  }

  public scrollToContact(id: string): void {
    this.locationService.scrollToElement(id);
  }

  public scrollToPlaces(id: string): void {
    this.locationService.scrollToElement(id)
  }

  public scrollToAbout(id: string): void {
    this.locationService.scrollToElement(id)
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
