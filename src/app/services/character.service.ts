import { Injectable } from '@angular/core';

export interface Character {
  id: number;
  name: string;
  alias: string;
  universe: string; // 'Marvel', 'DC', 'TVDU', etc
  image: string;
  power: string;
  powerLevel: number; // 0 a 100
  color: string; // Ex: #ff0000
  type?: string; // 'Magic', 'Tech', etc
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  
  // === SEU ARRAY DE DADOS (Substitua pelos dados do seu data.js) ===
  private characters: Character[] = [
    { id: 1, name: 'Wanda Maximoff', alias: 'Feiticeira Escarlate', universe: 'Marvel', image: 'assets/imagens/Ww.jpg', power: 'Manipulação da Realidade', powerLevel: 100, color: '#ef4444', type: 'Magic' },
    { id: 2, name: 'Doctor Strange', alias: 'Mago Supremo', universe: 'Marvel', image: 'assets/imagens/DoutorEstranho.jpg', power: 'Artes Místicas', powerLevel: 95, color: '#3b82f6', type: 'Magic' },
    { id: 3, name: 'Batman', alias: 'O Cavaleiro das Trevas', universe: 'DC', image: 'assets/imagens/batman.jpg', power: 'Inteligência e Tecnologia', powerLevel: 85, color: '#fbbf24', type: 'Tech' },
    { id: 4, name: 'Superman', alias: 'O Homem de Aço', universe: 'DC', image: 'assets/imagens/superman.jpg', power: 'Kryptoniano', powerLevel: 99, color: '#3b82f6', type: 'Tech' },
    // ... adicione o resto da sua lista aqui
  ];

  constructor() { }

  getCharacters() {
    return this.characters;
  }

  // === LÓGICA DE FAVORITOS (LocalStorage) ===
  getFavorites(): number[] {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
  }

  toggleFavorite(id: number): boolean {
    let favs = this.getFavorites();
    const index = favs.indexOf(id);
    let isAdded = false;

    if (index > -1) {
      favs.splice(index, 1); // Remove
    } else {
      favs.push(id); // Adiciona
      isAdded = true;
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    return isAdded;
  }

  // === LÓGICA DA ARENA (LocalStorage) ===
  getBattleVotes() {
    const votes = localStorage.getItem('battleArenaVotes');
    return votes ? JSON.parse(votes) : { wanda: 0, strange: 0 };
  }

  vote(hero: 'wanda' | 'strange') {
    const votes = this.getBattleVotes();
    votes[hero]++;
    localStorage.setItem('battleArenaVotes', JSON.stringify(votes));
    return votes;
  }
}