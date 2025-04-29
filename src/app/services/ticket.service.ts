import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = 'https://railway.stepprojects.ge/api/tickets';
  private bookedSeats: any[] = [];
  constructor(private http: HttpClient) {}

  bookTicket(data : any) {
    return this.http.post(`https://railway.stepprojects.ge/api/tickets/register`, data);
  }

  addSeats(seats: any[]) {
    this.bookedSeats.push(...seats);
  }

  getBookedSeats() {
    return this.bookedSeats;
  }

  clearBookedSeats() {
    this.bookedSeats = [];
  }

  private ticketsSubject = new BehaviorSubject<any[]>([]);
  tickets$ = this.ticketsSubject.asObservable();

  addTicket(ticket: any) {
    const currentTickets = this.ticketsSubject.getValue();
    this.ticketsSubject.next([...currentTickets, ticket]);
  }

  saveTicket(ticket: any): void {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }

  getAllTickets(): Observable<any[]> {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    return of(tickets);
  }
  
  deleteTicket(ticketId: number) {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = tickets.filter((ticket: any) => ticket.id !== ticketId);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  }
  
  
}

