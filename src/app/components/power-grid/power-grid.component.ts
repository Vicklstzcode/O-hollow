import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../services/character.service';

@Component({
  selector: 'app-power-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './power-grid.component.html',
  styleUrls: ['./power-grid.component.css']
})
export class PowerGridComponent {
  @Input() character: Character | undefined;

  // Helper to create an array for the stat bars
  getStatBars(stat: number | undefined): any[] {
    const totalBars = 7;
    const filledBars = stat || 0;
    const bars = [];
    for (let i = 0; i < totalBars; i++) {
      bars.push({ filled: i < filledBars });
    }
    return bars;
  }
}
