import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  trainId: string | null = null;
  vagonData: any;

  seats: any[] = [];
  selectedSeat:any = null;
  passengerForm: any = {};

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
          seatId: seat.seatId,
          number: seat.number,
          price: seat.price,
          isOccupied: seat.isOccupied,
          vagonId: seat.vagonId
        }));
    
        console.log('მიღებული ადგილები:', this.seats);
      });
    }


  
    
  }

  // fetchVagonData(id: string): void {
  //   const url = `https://railway.stepprojects.ge/api/getvagon/${id}`;
  //   this.http.get<any[]>(url).subscribe({
  //     next: data => {
  //       this.vagonData = data;
  //       console.log('ვაგონის ინფორმაცია:', data);
  //     },
  //     error: err => console.error('ვაგონები ვერ მოიძებნა:', err)
  //   });
  // }

  // selectVagon(vagon: any): void {
  //   console.log('არჩეული ვაგონი:', vagon);
  // }



  seatsByVagon: { vagonId: number, vagonName: string, seats: any[] }[] = [];

  fetchVagonData(id: string): void {
    const url = `https://railway.stepprojects.ge/api/getvagon/${id}`;
    this.http.get<any[]>(url).subscribe({
      next: vagonData => {
        this.vagonData = vagonData;
        console.log('ვაგონის ინფორმაცია:', vagonData);
  
        // ყველა ვაგონის ადგილების წამოღება
        vagonData.forEach((vagon) => {
          this.bookingService.getPlacesByWagonId(vagon.id).subscribe((seats) => {
            const freeSeats = seats.map((seat: any) => ({
              seatId: seat.seatId,
              number: seat.number,
              price: seat.price,
              isOccupied: seat.isOccupied,
              vagonId: seat.vagonId
            }));
  
            this.seatsByVagon.push({
              vagonId: vagon.id,
              vagonName: vagon.name,
              seats: vagon.seats
            });
          });
        });
  
      },
      error: err => console.error('ვაგონები ვერ მოიძებნა:', err)
    });
  }
  



  
  selectedVagon: any = null;

  selectVagon(vagon: any): void {
    console.log('არჩეული ვაგონი:', vagon);
    this.selectedVagon = vagon;

    this.bookingService.getPlacesByWagonId(vagon.id).subscribe((seats) => {
      
      console.log('API-დან მიღებული ადგილები:', seats);
      
      // this.seats = seats.map((seat: any) => ({
      //   seatId: seat.seatId,
      //   number: seat.number,
      //   price: seat.price,
      //   isOccupied: seat.isOccupied,
      //   vagonId: seat.vagonId
        
      // }));

      this.seats = seats
      .filter((seat: any) => !seat.isOccupied) // მხოლოდ თავისუფალი
      .map((seat: any) => ({
      seatId: seat.seatId,
      number: seat.placeNumber,
      price: seat.placePrice,
      isOccupied: seat.isOccupied,
      vagonId: seat.vagonId
      }));
  
      console.log('მიღებული ადგილები:', this.seats);
    });
  }
  


  // onSeatSelected(seatNumber: number) {
  //   this.selectedSeat = seatNumber;
  //   console.log('არჩეული ადგილი:', seatNumber);
  // }

  onSeatSelected(seat: any) {
    this.selectedSeat = {
      seatId: seat.seatId,
      number: seat.number,
      price: seat.price,
      vagonId: seat.vagonId
    };
    console.log('არჩეული ადგილი:', this.selectedSeat);
  }


  onSeatClick(seat: any): void {
    if (seat.isOccupied) {
      return;
    }
    this.onSeatSelected(seat);
    console.log('არჩეული ადგილი:', this.onSeatSelected(seat));

  }

 
//აქ მიწერია მგზავრის მონაცემები
passengerFirstName: string = '';
passengerLastName: string = '';
passengerId: string = '';
passengerPhone: string = '';
passengerEmail: string = '';


bookTicket(): void {
  if (!this.selectedSeat) return;
  
  const ticketData = {
    trainId: this.trainId,
    seatId: this.selectedSeat.seatId,
    price: this.selectedSeat.price,
    passenger: {
      firstName: this.passengerFirstName,
      lastName: this.passengerLastName,
      personalId: this.passengerId,
      phone: this.passengerPhone,
      email: this.passengerEmail
    },
  };

  this.http.post('https://railway.stepprojects.ge/api/tickets/register', ticketData).subscribe({
    next: (response: any) => {
      console.log('წარმატებით დაიჯავშნა:', response);
      alert('არჩეული ბილეთი წარმატებით დაიჯავშნა!');
    },
    error: (err: unknown) => {
      console.error('დაჯავშნისას მოხდა შეცდომა:', err);
      alert('დაჯავშნისას მოხდა შეცდომა.');
    }
  });
}

  
}

