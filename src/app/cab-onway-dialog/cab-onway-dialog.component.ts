import { Component, Inject, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
export interface PriceDialogData {
  price: number;
  distance: number;
}
@Component({
  selector: 'app-cab-onway-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatButtonModule,
    MatDialogTitle,],
  templateUrl: './cab-onway-dialog.component.html',
  styleUrl: './cab-onway-dialog.component.scss'
})
export class CabOnwayDialogComponent {
  readonly dialogRef = inject(MatDialogRef);
  readonly data = inject<PriceDialogData>(MAT_DIALOG_DATA);
  readonly onwayFieldsData = {price:this.data.price , distance:this.data.distance};
  
  bookCab(vehicalType:string){}
}
