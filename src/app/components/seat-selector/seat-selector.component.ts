import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selector.component.html',
  styleUrls: ['./seat-selector.component.scss']
})
export class SeatSelectorComponent {
  @Input() seats: any[] = [];
  @Output() seatSelected = new EventEmitter<number>();

  selectSeat(seat: any) {
    if (seat.isAvailable) {
      this.seatSelected.emit(seat.seatNumber);
    }
  }
}
