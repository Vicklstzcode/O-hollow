import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement, AchievementService } from '../../services/achievement.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../pages/home/navbar.component';

declare var lucide: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  achievements: Achievement[] = [];
  earnedCount: number = 0;
  totalCount: number = 0;

  constructor(
    private achievementService: AchievementService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.achievementService.getAchievements().subscribe(achievements => {
      this.achievements = achievements;
      this.totalCount = achievements.length;
      this.earnedCount = achievements.filter(a => a.earned).length;
      this.updateIcons();
    });
  }

  ngAfterViewInit() {
    this.updateIcons();
  }

  updateIcons() {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
