import { Component, Inject, OnInit, afterNextRender } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from "./footer/footer.component";
import { SupabaseService } from './supabase.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, HomeComponent, RouterLink,RouterOutlet,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  constructor(
    private supabase: SupabaseService,
    private meta: Meta,
    private title: Title
  ) {
    afterNextRender(() => {
      this.supabase.initialize();
    })
    this.title.setTitle('KiteCab - Cab Service Fast & Reliable');
    this.meta.addTags([
      { name: 'description', content: 'KiteCab provides reliable, fast, and affordable cab services in Chhattisgarh and more places.' },
      { name: 'keywords', content: 'cab in Raipur,kite cab, cab in Bhilai, and more' },
      { property: 'og:title', content: 'KiteCab - Cab Service Fast & Reliable' },
      { property: 'og:description', content: 'Get to your destination safely and quickly with KiteCab.' },
      { property: 'og:image', content: 'https://kitecab.com/assets/20241024_121332.png' },
      { property: 'og:url', content: 'https://kitecab.com' },
    ]);
  }
  ngOnInit(): void {
    // Set page title
    this.title.setTitle('KiteCab - Cab Service Fast & Reliable');

    // Update meta tags
    this.meta.updateTag({ name: 'description', content: 'KiteCab provides reliable, fast, and affordable cab services in Chhattisgarh and more places.' });
    this.meta.updateTag({ name: 'keywords', content: 'cab in Raipur, kite cab, cab in Bhilai, cab in Durg, and more' });

    // Open Graph meta tags
    this.meta.updateTag({ property: 'og:title', content: 'KiteCab - Cab Service Fast & Reliable' });
    this.meta.updateTag({ property: 'og:description', content: 'Get to your destination safely and quickly with KiteCab.' });
    this.meta.updateTag({ property: 'og:image', content: 'https://kitecab.com/assets/20241024_121332.png' });
    this.meta.updateTag({ property: 'og:url', content: 'https://kitecab.com' });
  }
  }

