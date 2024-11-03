import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  constructor(private router: Router) { }
  private readonly adminEmail = 'xyz@gmail.com';
  private readonly adminPassword = '909090';

  login(email:any,password:any) {
    this.isLoggedIn = true;
    if (email === this.adminEmail && password === this.adminPassword) {
      this.router.navigate(['/admin']);
      this.isLoggedIn = true;
      return true;
    }
    return false;
  }

  isAdmin(): boolean {
    return this.isLoggedIn;
  }

  logout() {
    this.isLoggedIn = false;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}
