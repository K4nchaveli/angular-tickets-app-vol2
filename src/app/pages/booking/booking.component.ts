import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';


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
  bookedSeats: number[] = [];
  selectedSeats: any[] = [];
  totalPrice: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient,private bookingService: BookingService,
    private tktService : TicketService
  ) {}


  ngOnInit(): void {
    this.trainId = this.route.snapshot.paramMap.get('id');
  
    const savedSeat = localStorage.getItem('selectedSeat');
    if (savedSeat) {
      this.selectedSeat = JSON.parse(savedSeat);
      console.log('შენახული არჩეული ადგილი localStorage-დან:', this.selectedSeat);
    }
  
    const bookedSeats = JSON.parse(localStorage.getItem('bookedSeats') || '[]');
  
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
          isOccupied: seat.isOccupied || bookedSeats.includes(seat.seatId),
          vagonId: seat.vagonId
        }));
      });
    }
  }
  
  people: { name: string }[] = [];

updatePassengerInputs() {
  this.people = this.selectedSeats.map(() => ({ name: '' }));
}

  clearBookedSeats(): void {
    localStorage.removeItem('bookedSeats');
    alert('დაჯავშნილი ადგილები გასუფთავდა!');
    window.location.reload();
  }


  seatsByVagon: { vagonId: number, vagonName: string, seats: any[] }[] = [];

  fetchVagonData(id: string): void {
    const url = `https://railway.stepprojects.ge/api/getvagon/${id}`;
    this.http.get<any[]>(url).subscribe({
      next: vagonData => {
        this.vagonData = vagonData;
        console.log('ვაგონის ინფორმაცია:', vagonData);
  
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

      this.seats = seats
      .filter((seat: any) => !seat.isOccupied) //აქ გამომაქვს მხოლოდ თავისუფალი ადგილები
      .map((seat: any) => ({
      seatId: seat.seatId,
      number: seat.number,
      price: seat.price,
      isOccupied: seat.isOccupied,
      vagonId: seat.vagonId
      }));
  
      console.log('მიღებული ადგილები:', this.seats);
    });
  }
  

  onSeatSelected(seat: any) {
    this.selectedSeat = {
      seatId: seat.seatId,
      number: seat.number,
      price: seat.price,
      vagonId: seat.vagonId
    };

    localStorage.setItem('selectedSeat', JSON.stringify(this.selectedSeat));

    console.log('არჩეული ადგილი:', this.selectedSeat);
  }




onSeatClick(seat: any) {
  // const index = this.selectedSeats.findIndex(s => s.number === seat.number);
  const index = this.selectedSeats.indexOf(seat);
    if (!seat.isOccupied) {
      this.selectedSeat = seat;
    }
  if (index > -1) {

    this.selectedSeats.splice(index, 1);
  } else {

    this.selectedSeats.push(seat);
  }
  this.updatePassengerInputs();

  this.totalPrice = this.selectedSeats.reduce((sum, s) => sum + s.price, 0);

  localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
}


passengerFirstName: string = '';
passengerLastName: string = '';
passengerId: string = '';
passengerPhone: string = '';
passengerEmail: string = '';


updateSeatStatus(): void {
  this.seatsByVagon.forEach(vagon => {
    vagon.seats.forEach(seat => {
      if (this.bookedSeats.includes(seat.seatId)) {
        seat.isOccupied = true;
      }
    });
  });
}




bookTicket(): void {
  if (this.selectedSeat.length===0) return;

  if (!this.passengerFirstName || !this.passengerLastName || !this.passengerId || !this.passengerPhone || !this.passengerEmail) {
    alert('გთხოვთ, შეავსოთ მგზავრის ყველა ველი!');
    return;
  }

  const currentDate = new Date().toISOString();

  this.selectedSeats.forEach((seat) => {
    const ticketData = {
      trainId: Number(this.trainId),
      date: currentDate,
      phoneNumber: this.passengerPhone,
      email: this.passengerEmail,
      people: [{
        seatId: seat.seatId,
        name: this.passengerFirstName,
        surname: this.passengerLastName,
        idNumber: this.passengerId,
        payoutCompleted: true,
      }],
    };


    seat.isOccupied = true;

    this.selectedSeat.isOccupied = true;
    this.selectedSeats = [];
    this.totalPrice = 0;
    this.passengerFirstName = '';
    this.passengerLastName = '';
    this.passengerId = '';
    this.passengerPhone = '';
    this.passengerEmail = '';

    const bookedSeats = JSON.parse(localStorage.getItem('bookedSeats') || '[]');
    this.selectedSeats.forEach(seat => bookedSeats.push(seat.seatId));
    localStorage.setItem('bookedSeats', JSON.stringify(bookedSeats));

    this.updateSeatStatus();

    console.log('არჩეული ადგილები:', this.selectedSeats);
    console.log('მგზავრები:', this.people);

    localStorage.removeItem('selectedSeat');
  
   this.tktService.bookTicket(ticketData).subscribe({
    next: (resp) => alert(resp),
    error: (err) => {
    
      if (err.error.text) {
        alert(err.error.text); 
      } else {
        alert('მოხდა შეცდომა: ' + err.message);
      }
    }
  });


});
}

}

