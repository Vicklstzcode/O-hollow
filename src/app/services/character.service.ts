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
  // Power Grid
  intelligence?: number;
  strength?: number;
  speed?: number;
  durability?: number;
  energyProjection?: number;
  fightingSkills?: number;
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

  // Mapa de conexões movido para o serviço
  private mapaConexoes: { [key: number]: { id: number, relacao: string }[] } = {
    // Feiticeira Escarlate (1)
    1: [
      { id: 2, relacao: 'Aliado nos Vingadores e mestre das artes místicas.' },
      { id: 4, relacao: 'Mentora sombria que a manipulou em Westview.' },
      { id: 5, relacao: 'Seu filho, uma poderosa entidade mágica.' },
      { id: 20, relacao: 'Ambas são hospedeiras de forças cósmicas (Caos e Fênix).' }
    ],
    // Doutor Estranho (2)
    2: [
      { id: 1, relacao: 'Aliada e adversária na manipulação da realidade.' },
      { id: 11, relacao: 'Colega e rival nas artes do ocultismo.' },
      { id: 13, relacao: 'Enfrentou suas ilusões e trapaças interdimensionais.' },
      { id: 16, relacao: 'Ambos protegem a realidade de ameaças místicas e infernais.'}
    ],
    // Ravena (21)
    21: [
        { id: 19, relacao: 'Ambos usam traumas e dimensões sombrias para atacar.' },
        { id: 16, relacao: 'Compartilham uma herança infernal e lutam contra o destino.' },
        { id: 1, relacao: 'Seu poder empático reflete a instabilidade emocional de Wanda.' },
        { id: 11, relacao: 'Constantine e Ravena são pilares da Liga da Justiça Sombria.' }
    ],
    // Loki (13)
    13: [
        { id: 2, relacao: 'Foi aprisionado e confrontado pelo Mago Supremo.' },
        { id: 1, relacao: 'Ambos são mestres em magia e manipulação de mentes.' },
        { id: 10, relacao: 'Como Rand, Loki é uma figura destinada a causar caos e transformação.' },
        { id: 4, relacao: 'Ambos são feiticeiros antigos com sede de poder e conhecimento.'}
    ],
    // Agatha Harkness (4)
    4: [
      { id: 1, relacao: 'Tentou roubar a Magia do Caos de Wanda.'},
      { id: 7, relacao: 'Selene e Agatha são duas das mais antigas e poderosas feiticeiras.'},
      { id: 16, relacao: 'Ambas são bruxas experientes que compreendem o custo do poder.'},
      { id: 2, relacao: 'O conhecimento de Agatha sobre magia negra é uma ameaça que Strange monitora.'}
    ],
    // Bonnie Bennett (3)
    3: [
      { id: 21, relacao: 'Aliada nas artes arcanas e controle de forças sombrias.' },
      { id: 16, relacao: 'Compartilha o caminho da bruxaria e desafios sobrenaturais.' },
      { id: 1, relacao: 'Similaridades na manipulação de magia poderosa e destino trágico.' }
    ],
    // Selene Gallio (7)
    7: [
      { id: 4, relacao: 'Antigas e poderosas bruxas, ambas com vasta experiência em magia negra.' },
      { id: 16, relacao: 'Ambas bruxas que extraem poder de fontes sombrias ou infernais.' }
    ],
    // Storm (8)
    8: [
      { id: 20, relacao: 'Amigas e líderes dos X-Men, ambas com poderes de nível ômega.' },
      { id: 1, relacao: 'Ambas controlam forças elementais e possuem grande poder destrutivo.' }
    ],
    // Moiraine Damodred (9)
    9: [
      { id: 10, relacao: 'Mentora e guia do Dragão Renascido em sua jornada.' }
    ],
    // Rand al\'Thor (10)
    10: [
      { id: 9, relacao: 'O Dragão Renascido, guiado por Moiraine.' },
      { id: 1, relacao: 'Ambos com grande poder de manipular a realidade e o destino.' }
    ],
    // John Constantine (11)
    11: [
      { id: 2, relacao: 'Colega e rival nas artes do ocultismo e magia sombria.' },
      { id: 21, relacao: 'Ambos são pilares da Liga da Justiça Sombria, lidando com ameaças místicas.' }
    ],
    // Sabrina Spellman (16)
    16: [
      { id: 2, relacao: 'Ambos protegem a realidade de ameaças místicas e infernais.' },
      { id: 3, relacao: 'Compartilha o caminho da bruxaria e desafios sobrenaturais.' },
      { id: 7, relacao: 'Ambas bruxas que extraem poder de fontes sombrias ou infernais.' },
      { id: 21, relacao: 'Compartilham uma herança infernal e lutam contra o destino.' }
    ],
    // Eleven (17)
    17: [
      { id: 19, relacao: 'Archenimigos com poderes psíquicos do Mundo Invertido.' },
      { id: 1, relacao: 'Ambas com grandes poderes que afetam a realidade, e traumas profundos.' }
    ],
    // Vecna (19)
    19: [
      { id: 17, relacao: 'Archenimigos com poderes psíquicos do Mundo Invertido.' },
      { id: 21, relacao: 'Ambos usam traumas e dimensões sombrias para atacar.' }
    ],
    // Fênix (20)
    20: [
      { id: 1, relacao: 'Ambas são hospedeiras de forças cósmicas (Caos e Fênix).' },
      { id: 8, relacao: 'Amigas e líderes dos X-Men, ambas com poderes de nível ômega.' }
    ]
  };

  constructor() {
    localStorage.removeItem(this.CHARACTERS_KEY); // TEMPORARY: Clear localStorage to ensure fresh data load.
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

  getConnectionsFor(id: number): { id: number, relacao: string }[] {
    return this.mapaConexoes[id] || [];
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

  updateCharacter(id: number, updatedChar: Character) {
    const currentCharacters = this.getCharacters();
    const index = currentCharacters.findIndex(c => c.id === id);
    if (index > -1) {
      const characters = [...currentCharacters];
      characters[index] = { ...updatedChar, id: id }; // Ensure ID remains the same
      this.updateCharacters(characters);
    } else {
      console.warn(`Character with ID ${id} not found for update.`);
    }
  }

  deleteCharacter(id: number) {
    const currentCharacters = this.getCharacters();
    const updatedCharacters = currentCharacters.filter(c => c.id !== id);
    if (updatedCharacters.length < currentCharacters.length) {
      this.updateCharacters(updatedCharacters);
    } else {
      console.warn(`Character with ID ${id} not found for deletion.`);
    }
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