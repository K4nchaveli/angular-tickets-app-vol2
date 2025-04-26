import { Routes } from '@angular/router';
import { BookingComponent } from './pages/booking/booking.component';
import { SearchComponent } from './pages/search/search.component';
import { TicketsComponent } from './tickets/tickets.component';

export const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },

    { path: 'search', component: SearchComponent,title : 'search' },
    { path: 'booking/:id', component: BookingComponent,title: 'booking' },
    { path: 'tickets', component: TicketsComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

