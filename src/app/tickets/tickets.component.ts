import { Component, OnInit } from "@angular/core";
import { TicketService } from "../services/ticket.service";
import { CommonModule, DatePipe } from "@angular/common";
import { ApiService } from "../services/api.service";
declare let swal: any;

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit{
  tickets: any[] = [];

  selectedFromStation: string = '';
  selectedToStation: string = '';



  constructor(private ticketService: TicketService,private apiService: ApiService) {}

  ngOnInit(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
      },
      error: (err: any) => {
        console.error('ბილეთების წამოღების შეცდომა', err);
      }
    });
  }
  


  deleteTicket(ticketId: number): void {
    swal({
      title: "დარწმუნებული ხარ?",
      text: "ბილეთი წაიშლება სამუდამოდ!",
      icon: "warning",
      buttons: ["გაუქმება", "დიახ, წაშალე"],
      dangerMode: true,
    }).then((willDelete: any) => {
      if (willDelete) {
        const index = this.tickets.findIndex(t => t.id === ticketId);
  
        if (index !== -1) {
          this.tickets[index].deleting = true;
          setTimeout(() => {
            this.ticketService.deleteTicket(ticketId);
            this.tickets.splice(index, 1);
            swal({
              title: "წაშლილია!",
              text: "ბილეთი წარმატებით წაიშალა.",
              icon: "success",
              timer: 2000,
              buttons: false
            });
          }, 500);
        }
      }
    });
  }

}
