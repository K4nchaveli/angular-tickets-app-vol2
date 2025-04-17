import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  getPlacesByWagonId(vagonId: number): Observable<any[]> {
    return this.http.get<any[]>(`https://railway.stepprojects.ge/api/getvagon/${vagonId}`);
  }
}
