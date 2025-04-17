import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SeatSelectorComponent } from '../../components/seat-selector/seat-selector.component';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking',
  imports: [CommonModule,RouterModule,SeatSelectorComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  trainId: string | null = null;
  vagonData: any;

  constructor(private route: ActivatedRoute, private http: HttpClient,private bookingService: BookingService) {}

  ngOnInit(): void {
    this.trainId = this.route.snapshot.paramMap.get('id');
    if (this.trainId) {
      this.fetchVagonData(this.trainId);
    }

    const vagonId = this.route.snapshot.queryParamMap.get('vagonId');
    if (vagonId) {
      this.bookingService.getPlacesByWagonId(+vagonId).subscribe((seats) => {
        this.seats = seats.map((seat: any) => ({
          seatNumber: seat.placeNumber,
          isAvailable: seat.isAvailable,
        }));
      });
    }
  }

  fetchVagonData(id: string): void {
    const url = `https://railway.stepprojects.ge/api/getvagon/${id}`;
    this.http.get<any>(url).subscribe({
      next: data => {
        this.vagonData = data;
        console.log('ვაგონის ინფორმაცია:', data);
      },
      error: err => console.error('ვაგონები ვერ მოიძებნა:', err)
    });
  }

  selectVagon(vagon: any): void {
    console.log('არჩეული ვაგონი:', vagon);
  }
  

  seats: any[] = [];
  selectedSeat: number | null = null;

  onSeatSelected(seatNumber: number) {
    this.selectedSeat = seatNumber;
    console.log('არჩეული ადგილი:', seatNumber);
  }


}

