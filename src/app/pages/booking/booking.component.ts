import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule,Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { forkJoin } from 'rxjs';
declare let swal: any;


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})

export class BookingComponent implements OnInit {
  trainId: string | null = null;
  vagonData: any;
  selectedVagonClass: string | null = null;
  vagonClass: string = '';


  seats: any[] = [];
  selectedSeat:any = null;
  passengerForm: any = {};
  bookedSeats: number[] = [];
  selectedSeats: any[] = [];
  totalPrice: number = 0;

  people: Array<{
    firstName: string;
    lastName: string;
    personalId: string;
    phone: string;
    email: string;
    selectedSeat?: any;
  }> = [];

  constructor(private route: ActivatedRoute, private http: HttpClient,private bookingService: BookingService,
    private tktService : TicketService,private router: Router,private ticketService: TicketService) {}
  
  ngOnInit(): void {
    this.trainId = this.route.snapshot.paramMap.get('id');

    this.route.paramMap.subscribe(params => {
      this.trainId = params.get('trainId');
      this.selectedVagonClass = params.get('vagonClass');
    });
  
    const savedSeat = localStorage.getItem('selectedSeat');
    if (savedSeat) {
      this.selectedSeat = JSON.parse(savedSeat);
      // console.log('შენახული არჩეული ადგილი localStorage-დან:', this.selectedSeat);
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

updatePassengerInputs() {
  this.people = this.selectedSeats.map(() => ({
    firstName: '',
    lastName: '',
    personalId: '',
    phone: '',
    email: ''
  }));
}

  seatsByVagon: { vagonId: number, vagonName: string, seats: any[] }[] = [];

  fetchVagonData(id: string): void {
    const url = `https://railway.stepprojects.ge/api/getvagon/${id}`;
    const bookedSeats = JSON.parse(localStorage.getItem('bookedSeats') || '[]');
  
    this.http.get<any[]>(url).subscribe({
      next: vagonData => {
        this.vagonData = vagonData;
  
        const seatRequests = vagonData.map(vagon =>
          this.bookingService.getPlacesByWagonId(vagon.id).pipe()
        );
  
        forkJoin(seatRequests).subscribe((allSeats) => {
          this.seatsByVagon = vagonData.map((vagon, index) => {
            const seats = allSeats[index];
            const updatedSeats = seats.map((seat: any) => ({
              seatId: seat.seatId,
              number: seat.number,
              price: seat.price,
              seats: vagon.seats,
              isOccupied: seat.isOccupied || bookedSeats.includes(seat.seatId),
              vagonId: seat.vagonId
            }));
  
            return {
              vagonId: vagon.id,
              vagonName: vagon.name,
              seats: vagon.seats,
            };
            
          });
          
        });
      },
      error: err => {
        console.error('ვაგონები ვერ მოიძებნა:', err);
        swal("შეცდომა!", "ვაგონების ჩატვირთვა ვერ მოხერხდა", "error");
      }
    });
  }

  selectedVagon: any = null;

  selectVagon(vagon: any): void {
    this.selectedVagon = vagon;
   
    this.bookingService.getPlacesByWagonId(vagon.id).subscribe((seats) => {

      this.seats = seats
      .filter((seat: any) =>!this.selectedSeats.includes(seat.seatId) && !seat.isOccupied)
      .map((seat: any) => ({
      seatId: seat.seatId,
      number: seat.number,
      price: seat.price,
      isOccupied: seat.isOccupied || this.bookedSeats.includes(seat.seatId),
      vagonId: seat.vagonId,
      }));
      
  
      if (seats.length === 0) {
        swal("თავისუფალი ადგილები არ არის", "ამ ვაგონში ყველა ადგილი დაკავებულია", "warning");
      } else {
        swal({
          title: "თავისუფალი ადგილები ჩაიტვირთა",
          text: `${seats.length} ადგილი ხელმისაწვდომია`,
          icon: "success",
          buttons: false
        });
      }
  
      console.log('მიღებული ადგილები:', this.seats);
    }, error => {
      console.error('ადგილების ჩატვირთვის შეცდომა:', error);
      swal("შეცდომა!", "ვაგონის ადგილების ჩატვირთვა ვერ მოხერხდა", "error");
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

    swal({
      title: "ადგილი არჩეულია",
      text: `ადგილი #${seat.number} - ფასი: ${seat.price}₾`,
      icon: "success",
      timer: 2000,
      buttons: false
    });

  }

// onSeatClick(seat: any) {
//   const index = this.selectedSeats.indexOf(seat);

//   if (seat.isOccupied) {
//     swal({
//       title: "ადგილი დაკავებულია!",
//       text: `ადგილო #${seat.number} უკვე დაჯავშნილია.`,
//       icon: "error",
//       timer: 2000,
//       buttons: false
//     });
//     return;
//   }

//   if (index > -1) {
//     this.selectedSeats.splice(index, 1);
//     swal({
//       title: "ადგილი გაუქმდა",
//       text: `ადგილი #${seat.number} აღარ არის არჩეული.`,
//       icon: "warning",
//       timer: 1500,
//       buttons: false
//     });
//   } else {
//     this.selectedSeats.push(seat);
//     swal({
//       title: "არჩეული ადგილი",
//       text: `ადგილი #${seat.number} - ფასი: ${seat.price}₾`,
//       icon: "success",
//       timer: 1500,
//       buttons: false
//     });
//   }

//   this.selectedSeat = seat;
//   this.updatePassengerInputs();

//   this.totalPrice = this.selectedSeats.reduce((sum, s) => sum + s.price, 0);
//   localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
// }



onSeatClick(seat: any) {
  if (seat.isOccupied) {
    swal({
      title: "ადგილი დაკავებულია!",
      text: `ადგილი #${seat.number} უკვე დაჯავშნილია.`,
      icon: "error",
      timer: 2000,
      buttons: false
    });
    return;
  }

  const index = this.selectedSeats.findIndex(s => s.seatId === seat.seatId);

  if (index > -1) {
    this.selectedSeats.splice(index, 1);
    swal({
      title: "ადგილი გაუქმდა",
      text: `ადგილი #${seat.number} აღარ არის არჩეული.`,
      icon: "warning",
      timer: 1500,
      buttons: false
    });
  } else {
    this.selectedSeats.push(seat);
    swal({
      title: "არჩეული ადგილი",
      text: `ადგილი #${seat.number} - ფასი: ${seat.price}₾`,
      icon: "success",
      timer: 1500,
      buttons: false
    });
  }

    this.totalPrice = this.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
  
    this.selectedSeat = seat;
    this.updatePassengerInputs();
}

isSeatSelected(seat: any): boolean {
  return this.selectedSeats.some(s => s.seatId === seat.seatId);
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

bookTicket(i: number) {
  const passenger = this.people[i];
  const seat = this.selectedSeats[i];
  if (!seat) {
    swal({
      title: "გაფრთხილება!",
      text: "გთხოვთ, აირჩიოთ ადგილი მგზავრისთვის.",
      icon: "warning",
      timer: 2000,
      buttons: false
    });
    return;
  }

  if (!passenger.firstName || !passenger.lastName || !passenger.personalId || !passenger.phone || !passenger.email) {
    swal({
      title: "გთხოვთ შეავსოთ ყველა ველი!",
      text: "ყველა ინფორმაცია აუცილებლად შეავსეთ.",
      icon: "error",
      timer: 2500,
      buttons: false
    });
    return;
  }
  const currentDate = new Date().toISOString();

  const ticketData = {
    id: Date.now() + i,
    trainId: Number(this.trainId),
    date: currentDate,
    phoneNumber: passenger.phone,
    email: passenger.email,
    people: [{
      seatId: seat.seatId,
      seat: seat.seatNumber,
      number: seat.number,
      name: passenger.firstName,
      surname: passenger.lastName,
      idNumber: passenger.personalId,
      payoutCompleted: true
    }]
  };

  this.tktService.saveTicket(ticketData);

  seat.isOccupied = true;
  seat.isSelected = false;

  const bookedSeats = JSON.parse(localStorage.getItem('bookedSeats') || '[]');
  bookedSeats.push(seat.seatId);
  localStorage.setItem('bookedSeats', JSON.stringify(bookedSeats));

  this.updateSeatStatus();
  this.selectedSeats[i] = null;

  this.people[i] = {
    firstName: '',
    lastName: '',
    personalId: '',
    phone: '',
    email: ''
  };

  swal({
    title: "ბილეთი დაჯავშნილია!",
    text: "გმადლობთ, თქვენი ჯავშანი წარმატებით შესრულდა.",
    icon: "success",
    timer: 3000,
    buttons: false
  });

  const allBooked = this.selectedSeats.every(seat => seat === null);
  if (allBooked) {
    localStorage.removeItem('selectedSeat');
    localStorage.removeItem('selectedSeats');
    this.selectedSeat = null;
    this.selectedSeats = [];
    this.totalPrice = 0;

    setTimeout(() => {
      this.router.navigate(['/tickets']);
    }, 2000);
  }
}


// clearBookedSeats(i: number): void {
//   swal({
//     title: "დარწმუნებული ხარ?",
//     text: "დაჯავშნილი ადგილები წაიშლება!",
//     icon: "warning",
//     buttons: ["გაუქმება", "დიახ, წაშალე!"],
//     dangerMode: true,
//   }).then((willDelete: boolean) => {
//     if (willDelete) {
//       localStorage.removeItem('bookedSeats');
//       localStorage.removeItem('selectedSeat');

//       swal("წარმატებით წაიშალა!", {
//         icon: "success",
//       });

//       this.seats = this.seats.map(seat => ({
//         ...seat,
//         isOccupied: false
//       }));
      
//       this.seatsByVagon.forEach(vagon => {
//         vagon.seats = vagon.seats.map(seat => ({
//           ...seat,
//           isOccupied: false
//         }));
//       });

//       this.selectedSeat = null;
//       this.selectedSeats = [];
//       this.totalPrice = 0;
//       this.people[i] = {
//         firstName: '',
//         lastName: '',
//         personalId: '',
//         phone: '',
//         email: ''
//       };
//     }
//   });
// }

}