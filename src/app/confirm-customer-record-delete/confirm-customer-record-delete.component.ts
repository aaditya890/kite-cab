import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-confirm-customer-record-delete',
  standalone: true,
  imports: [MatButtonModule,MatDialogModule],
  templateUrl: './confirm-customer-record-delete.component.html',
  styleUrl: './confirm-customer-record-delete.component.scss'
})
export class ConfirmCustomerRecordDeleteComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmCustomerRecordDeleteComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  constructor(private locationService:LocationService){}
   // Cancel action
   public onCancel(): void {
    this.dialogRef.close(false); // Close dialog with a "false" result
  }

  // Confirm action
  public onConfirm(): void {
    this.dialogRef.close(true); // Close dialog with a "true" result
  }
}
