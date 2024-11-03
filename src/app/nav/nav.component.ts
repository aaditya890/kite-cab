import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { LocationService } from '../location.service';
import { MatDialog,MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule,RouterLink, MatIconModule,MatDialogModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  isMenuOpen = false;
  constructor(private locationService:LocationService,public dialog:MatDialog){}

  openLoginDialog(key:string){
      this.dialog.open(LoginComponent,{
        data:{
          key:key
        }
      })
  }

  scrollToContact(id:string) {
    this.locationService.scrollToElement(id);
  }

  scrollToPlaces(id:string){
      this.locationService.scrollToElement(id)
  }

  scrollToAbout(id:string){
    this.locationService.scrollToElement(id)
  }
  
  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
