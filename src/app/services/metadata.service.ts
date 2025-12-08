import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  private universesData: string[] = ['Marvel', 'DC', 'TVDU', 'A Roda do Tempo', 'O Mundo Sombrio de Sabrina', 'Stranger Things'];
  private typesData: string[] = ['Magic', 'Cosmic', 'Mutant', 'Psychic'];
  private powersData: string[] = ['Magia do Caos', 'Artes Místicas', 'Magia Ancestral', 'Magia Negra', 'Magia e Eletrocinese', 'Onipotência', 'Absorção de Vida', 'Controle Climático', 'Canalizar o Poder Único (Saidar)', 'Canalizar o Poder Único (Saidin)', 'Ocultismo e Magia Arcana', 'Magia Asgardiana e Ilusão', 'Magia Infernal e Celestial', 'Telecinese e Poderes Psiônicos', 'Poderes Psiônicos do Mundo Invertido', 'Força Fênix', 'Empatia Sombria e Magia Arcana'];

  constructor() { }

  getUniverses(): Observable<string[]> {
    return of(this.universesData);
  }

  getTypes(): Observable<string[]> {
    return of(this.typesData);
  }

  getPowers(): Observable<string[]> {
    return of(this.powersData);
  }
}
