import { Component, OnInit } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  stations: any[] = [];
  trains: any[] = [];
  from = '';
  to = '';
  date = '';
  passengers = 1;
  searched = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStations();
  }

  fetchStations(): void {
    this.http.get<any[]>('https://railway.stepprojects.ge/api/stations').subscribe({
      next: data => this.stations = data,
      error: err => console.error('სადგურები ვერ მოიძებნა:', err)
    });
  }

  onSearch(): void {
    if (!this.from || !this.to || !this.date) return;

    const url = `https://railway.stepprojects.ge/api/getdeparture?from=${this.from}&to=${this.to}&date=${this.date}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.trains = data[0]?.trains || [];
        this.searched = true;
      },
      error: (err) => {
        console.error('სადგურები ვერ მოიძებნა:', err);
        this.trains = [];
        this.searched = true;
      }
    });
  }
}

