// In your shared file or in cab-onway-dialog.component.ts
export interface PriceDialogData {
    pickupLocation: string;
    dropLocation: string;
    price: number;
    waitingTime?: number; // optional if it can be undefined
    extraDistance?: number;
  }
  