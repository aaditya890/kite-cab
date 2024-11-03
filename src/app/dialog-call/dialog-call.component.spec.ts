import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCallComponent } from './dialog-call.component';

describe('DialogCallComponent', () => {
  let component: DialogCallComponent;
  let fixture: ComponentFixture<DialogCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
