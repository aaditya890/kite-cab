import { Component, Inject, afterNextRender } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from "./footer/footer.component";
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, HomeComponent, RouterLink,RouterOutlet,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    private supabase: SupabaseService
  ) {
    afterNextRender(() => {
      this.supabase.initialize();
    })
  }
}

