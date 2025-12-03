import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  gif?: string; // Adicionamos um campo opcional para o GIF
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
  // Chaves para o localStorage
  private readonly CHARACTERS_KEY = 'mysticos_characters';
  private readonly COMMENTS_KEY = 'mysticos_comments';

  // BehaviorSubject para manter e emitir a lista de personagens
  private charactersSubject: BehaviorSubject<Character[]>;

  // Dados estáticos dos universos (poderiam vir de outro lugar)
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

  constructor() {
    // Ao iniciar o serviço, carrega os dados do localStorage ou usa os dados iniciais
    const storedCharacters = localStorage.getItem(this.CHARACTERS_KEY);
    const initialCharacters = storedCharacters ? JSON.parse(storedCharacters) : CHARACTERS_DATA;
    this.charactersSubject = new BehaviorSubject<Character[]>(initialCharacters);
  }

  // --- MÉTODOS REATIVOS (com Observables) ---

  getCharactersObservable(): Observable<Character[]> {
    return this.charactersSubject.asObservable();
  }

  // === MÉTODOS DE LEITURA ===

  // Retorna o valor atual (para componentes não reativos ou acesso síncrono)
  getCharacters() {
    return this.charactersSubject.getValue();
  }

  getCharacterById(id: number): Character | undefined {
    return this.getCharacters().find(c => c.id === id);
  }

  getCharactersByUniverse(universeName: string): Character[] {
    return this.getCharacters().filter(c => c.universe === universeName);
  }

  getUniverseInfo(name: string) {
    const info = this.universesData[name] || {
      name: name,
      description: 'Um universo misterioso com segredos ainda não revelados.',
      image: 'assets/imagens/default-universe.jpg',
      characterCount: 0
    };
    
    const count = this.getCharacters().filter(c => c.universe === name).length;
    return { ...info, characterCount: count };
  }

  // === MÉTODOS DE ESCRITA (Adicionar Personagem) ===

  addCharacter(newChar: Character) {
    const currentCharacters = this.getCharacters();
    // Gera um ID novo (pega o último ID + 1)
    const newId = currentCharacters.length > 0 
        ? Math.max(...currentCharacters.map(c => c.id)) + 1 
        : 1;
    
    newChar.id = newId;
    const updatedCharacters = [...currentCharacters, newChar];
    
    this.updateCharacters(updatedCharacters);
  }

  // Método privado para atualizar o Subject e o localStorage
  private updateCharacters(characters: Character[]) {
    localStorage.setItem(this.CHARACTERS_KEY, JSON.stringify(characters));
    this.charactersSubject.next(characters);
  }

  // === COMENTÁRIOS ===

  getComments(characterId: number): any[] {
    const allComments = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '{}');
    const comments = allComments[characterId] || [];
    // Ordena para mostrar os mais recentes primeiro
    return comments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addComment(characterId: number, comment: any) {
    const allComments = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '{}');
    
    if (!allComments[characterId]) {
      allComments[characterId] = [];
    }
    
    // Adiciona um ID único ao comentário para permitir edição/exclusão
    const newComment = {
      id: Date.now(),
      ...comment
    };

    // Adiciona no início da lista para aparecer primeiro
    allComments[characterId].unshift(newComment); 
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));
  }

  updateComment(characterId: number, commentId: number, newText: string) {
    const allComments = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '{}');
    if (allComments[characterId]) {
      const commentIndex = allComments[characterId].findIndex((c: any) => c.id === commentId);
      if (commentIndex > -1) {
        allComments[characterId][commentIndex].text = newText;
        localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));
      }
    }
  }

  deleteComment(characterId: number, commentId: number) {
    const allComments = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '{}');
    if (allComments[characterId]) {
      allComments[characterId] = allComments[characterId].filter((c: any) => c.id !== commentId);
      localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));
    }
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