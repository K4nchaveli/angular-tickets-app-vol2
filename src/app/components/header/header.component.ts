import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  active = "active";

  private themeService = inject(ThemeService);

  isDark = computed(() => this.themeService.isDarkMode());

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
