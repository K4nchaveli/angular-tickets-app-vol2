import { Routes } from '@angular/router';
import { BookingComponent } from './pages/booking/booking.component';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
    { path: '', component: SearchComponent },
    { path: 'search', component: SearchComponent,title : 'search' },
    { path: 'booking/:id', component: BookingComponent,title: 'booking' },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

