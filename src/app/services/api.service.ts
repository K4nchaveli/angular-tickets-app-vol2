import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {


  constructor(private http: HttpClient) {}

  getStations(): Observable<any> {
    return this.http.get('https://railway.stepprojects.ge/api/stations');
  }

  getTrains(from: string, to: string, date: string): Observable<any> {
    return this.http.get(`https://railway.stepprojects.ge/api/getdeparture?from=${from}&to=${to}&date=${date}`);

  }
}

