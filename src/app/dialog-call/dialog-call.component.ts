import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialog-call',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './dialog-call.component.html',
  styleUrl: './dialog-call.component.scss'
})
export class DialogCallComponent {
  copied = false;
  number = '+91 6263676216';

  constructor(private snackBar: MatSnackBar) { }

  public callNumber():void {
    const phoneNumber = '+916263676216';
    window.location.href = `tel:${phoneNumber}`;
  }

}
