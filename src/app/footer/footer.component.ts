import { Component } from '@angular/core';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  email: string = "kiteCab00@gmail.com"
  constructor(private locationService:LocationService){}
  scrollToPlaces(id: string) {
    this.locationService.scrollToElement(id)
  }

  scrollToAbout(id: string) {
    this.locationService.scrollToElement(id)
  }
}
