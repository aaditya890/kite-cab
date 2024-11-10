import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  adminForm!: FormGroup;
  driverForm!: FormGroup;
  isAdmin: Boolean = false;
  driverRegistrationForm!: FormGroup;
  showRegistrationForm: boolean = false;
  constructor(private fb: FormBuilder, private router: Router,private authService:AuthService,public dialog:MatDialog) { }

  ngOnInit(): void {
    this.isAdmin = this.data.key === 'admin' ? true : false;
    // Initialize forms
    this.adminForm = this.fb.group({
      adminId: ['', [Validators.required]]
    });

    this.driverForm = this.fb.group({
      driverId: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.driverRegistrationForm = this.fb.group({
      name: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      vehicleNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin(userType: string) {
    if (userType === 'admin' && this.adminForm.valid) {
      if (this.adminForm.valid) {
        const  {adminId} = this.adminForm.value;
        if (this.authService.login(adminId)) {
          this.dialog.closeAll();
        } else {
          alert('Invalid Id!'); // Notify user of invalid credentials
        }
      }
    } else if (userType === 'driver' && this.driverForm.valid) {
      // Logic to handle driver login
      // console.log('Driver logged in:', this.driverForm.value);
    }
  }

  onRegisterDriver() {
    this.showRegistrationForm = true
  }

  onSubmitRegistration(): void {
    if (this.driverRegistrationForm.valid) {
      // console.log("Driver Registration: ", this.driverRegistrationForm.value);
      this.driverRegistrationForm.reset(); // Reset the form after successful registration
      this.showRegistrationForm = false; // Hide the registration form after submission 
    }
  }


}
