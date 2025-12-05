import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  earned: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private readonly ACHIEVEMENTS_KEY = 'mysticos_achievements';

  private achievementsSubject: BehaviorSubject<Achievement[]>;

  private allAchievements: Achievement[] = [
    { id: 'explorer-1', name: 'Explorador Novato', description: 'Visite 5 páginas de personagens diferentes.', icon: 'compass', earned: false },
    { id: 'explorer-2', name: 'Viajante Dimensional', description: 'Visite 15 páginas de personagens diferentes.', icon: 'milestone', earned: false },
    { id: 'historian-1', name: 'Historiador', description: 'Leia a história de 3 personagens.', icon: 'book-open', earned: false },
    { id: 'superfan-1', name: 'Super-Fã', description: 'Favorite 3 personagens.', icon: 'heart', earned: false },
    { id: 'contributor-1', name: 'Debatedor', description: 'Deixe seu primeiro comentário.', icon: 'message-square', earned: false },
  ];

  constructor() {
    const storedAchievements = localStorage.getItem(this.ACHIEVEMENTS_KEY);
    const initialAchievements = storedAchievements ? JSON.parse(storedAchievements) : this.allAchievements;
    this.achievementsSubject = new BehaviorSubject<Achievement[]>(initialAchievements);
  }

  getAchievements(): Observable<Achievement[]> {
    return this.achievementsSubject.asObservable();
  }

  getCurrentAchievements(): Achievement[] {
    return this.achievementsSubject.getValue();
  }

  private grantAchievement(achievementId: string) {
    const currentAchievements = this.getCurrentAchievements();
    const achievement = currentAchievements.find(a => a.id === achievementId);

    if (achievement && !achievement.earned) {
      achievement.earned = true;
      this.updateAchievements(currentAchievements);
      // Here you could add a toast notification to inform the user
      console.log(`Achievement Unlocked: ${achievement.name}`);
    }
  }

  private updateAchievements(achievements: Achievement[]) {
    localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    this.achievementsSubject.next(achievements);
  }

  // --- Tracking Methods ---

  trackPageVisit(characterId: number) {
    const visitedPages = this.getTrackedData('visitedPages');
    if (!visitedPages.includes(characterId)) {
      visitedPages.push(characterId);
      this.saveTrackedData('visitedPages', visitedPages);
    }

    if (visitedPages.length >= 5) {
      this.grantAchievement('explorer-1');
    }
    if (visitedPages.length >= 15) {
      this.grantAchievement('explorer-2');
    }
  }
  
  trackHistoryRead(characterId: number) {
    const readHistories = this.getTrackedData('readHistories');
    if (!readHistories.includes(characterId)) {
        readHistories.push(characterId);
        this.saveTrackedData('readHistories', readHistories);
    }

    if (readHistories.length >= 3) {
        this.grantAchievement('historian-1');
    }
  }

  trackFavorite() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.length >= 3) {
      this.grantAchievement('superfan-1');
    }
  }

  trackComment() {
    this.grantAchievement('contributor-1');
  }

  private getTrackedData(key: string): any[] {
    const data = localStorage.getItem(`tracker_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private saveTrackedData(key: string, data: any[]) {
    localStorage.setItem(`tracker_${key}`, JSON.stringify(data));
  }
}
