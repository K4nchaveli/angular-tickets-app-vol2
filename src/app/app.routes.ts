import { Routes } from '@angular/router';
import { BookingComponent } from './pages/booking/booking.component';
import { SearchComponent } from './pages/search/search.component';
import { HeaderComponent } from './components/header/header.component';

export const routes: Routes = [
    { path: '', component: HeaderComponent, title: 'home' },
    { path: 'search', component: SearchComponent,title : 'search' },
    { path: 'booking/:id', component: BookingComponent,title: 'booking' },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

