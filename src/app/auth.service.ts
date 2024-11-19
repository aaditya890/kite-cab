import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly mainAdminId = 'ac9020x';
  private isLoggedIn = false;

  constructor(
    private router: Router,
    public snackbar:MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to check if it's running in a browser
  ) {
    // Set `isLoggedIn` based on localStorage if in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem("admin");
    }
  }

  login(adminID: any): boolean {
    if (adminID === this.mainAdminId) {
      this.router.navigate(['/ec-admin00']);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem("admin", "true");
      }
      this.isLoggedIn = true;
      this.snackbar.open("Admin Login Success","DISMISS",{
        duration:3000
      })
      return true;
    }
    return false;
  }

  isAdmin(): boolean {
    return this.isLoggedIn;
  }

  logout() {
    this.isLoggedIn = false;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("admin");
      this.snackbar.open("Admin Logged Out Success","DISMISS",{
        duration:3000
      })
    }
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    // Check `isLoggedIn` and `localStorage` only in the browser
    return this.isLoggedIn && isPlatformBrowser(this.platformId) && localStorage.getItem("admin") === "true";
  }

  navigateToAdmin() {
    if (this.isAuthenticated()) {
      this.router.navigate(['/ec-admin00']);
    }
  }
}
