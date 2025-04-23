import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = 'https://railway.stepprojects.ge/api/tickets';

  constructor(private http: HttpClient) {}

  // bookTicket(data: { userId: string; seatId: number; date: string }) {
  //   return this.http.post(`${this.apiUrl}/tickets`, data);
  // }
  bookTicket(data : any) {
    return this.http.post(`https://railway.stepprojects.ge/api/tickets/register`, data);
  }
}

