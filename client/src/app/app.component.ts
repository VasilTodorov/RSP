import { Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { NavbarComponent} from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'client';
  private dataService = inject(DataService);
  responseData?: { message: string };

  ngOnInit() {
    this.dataService.getHello().subscribe(data => {
      this.responseData = data;
    });
  }
}
