import { Component } from '@angular/core';
import { LocationService } from '../location.service';
import { LoginComponent } from '../login/login.component';
import { MatDialog,MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  email: string = "kiteCab00@gmail.com"
  constructor(private locationService:LocationService, private dialog:MatDialog,private router:Router,private authService:AuthService){}
  
  public scrollToPlaces(id: string):void {
    this.locationService.scrollToElement(id)
  }

  public openLoginDialog(key: string):void {
    const checkAdminLs = localStorage.getItem("admin");
  
    if (checkAdminLs) {
      // Use AuthService to navigate if the admin is already logged in
      this.authService.navigateToAdmin();
    } else {
      // Open login dialog if not logged in
      this.dialog.open(LoginComponent, {
        data: { key: key }
      });
    }
  }  

  public scrollToAbout(id: string):void {
    this.locationService.scrollToElement(id)
  }
}
