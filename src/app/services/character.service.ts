import { Injectable } from '@angular/core';
import { CHARACTERS_DATA } from '../data/characters-data'; // Importa a "API"

// A interface agora deve incluir todos os campos que usamos
export interface Character {
  id: number;
  name: string;
  alias: string;
  universe: string;
  type: string;
  power: string;
  image: string;
  color: string;
  symbol?: string;
  history?: string;
  powerLevel: number;
  affiliations?: string[];
  weaknesses?: string[];
  abilities?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  getCharactersObservable() {
    throw new Error('Method not implemented.');
  }

  // Carrega os dados iniciais
  // Nota: Em uma app real, isso viria de um http.get()
  private characters: Character[] = CHARACTERS_DATA;

  private universesData: any = {
    'Marvel': {
      name: 'Marvel',
      description: 'Um vasto multiverso de heróis e vilões, onde a magia se encontra com a ciência avançada e mutações genéticas.',
      image: 'assets/imagens/marvel-bg.jpg', 
      characterCount: 0
    },
    'DC': {
      name: 'DC Comics',
      description: 'O lar dos maiores ícones da justiça, deuses entre nós e detetives sombrios protegendo a humanidade.',
      image: 'assets/imagens/dc-bg.jpg',
      characterCount: 0
    },
    'TVDU': {
      name: 'The Vampire Diaries Universe',
      description: 'Um mundo sobrenatural oculto onde vampiros, bruxas e lobisomens lutam por poder e sobrevivência.',
      image: 'assets/imagens/tvdu-bg.jpg',
      characterCount: 0
    }
  };

  constructor() { }

  // === MÉTODOS DE LEITURA ===

  getCharacters() {
    return this.characters;
  }

  getCharacterById(id: number): Character | undefined {
    return this.characters.find(c => c.id === id);
  }

  getCharactersByUniverse(universeName: string): Character[] {
    return this.characters.filter(c => c.universe === universeName);
  }

  getUniverseInfo(name: string) {
    const info = this.universesData[name] || {
      name: name,
      description: 'Um universo misterioso com segredos ainda não revelados.',
      image: 'assets/imagens/default-universe.jpg',
      characterCount: 0
    };
    
    const count = this.characters.filter(c => c.universe === name).length;
    return { ...info, characterCount: count };
  }

  // === MÉTODOS DE ESCRITA (Adicionar Personagem) ===

  addCharacter(newChar: Character) {
    // Gera um ID novo (pega o último ID + 1)
    const newId = this.characters.length > 0 
        ? Math.max(...this.characters.map(c => c.id)) + 1 
        : 1;
    
    newChar.id = newId;
    this.characters.push(newChar);
    
    console.log('Personagem adicionado:', newChar);
  }

  // === FAVORITOS E VOTAÇÃO (Mantidos) ===

  getFavorites(): number[] {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
  }

  toggleFavorite(id: number): boolean {
    let favs = this.getFavorites();
    const index = favs.indexOf(id);
    let isAdded = false;

    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(id);
      isAdded = true;
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    return isAdded;
  }

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