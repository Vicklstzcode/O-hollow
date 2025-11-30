import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';

@Component({
  selector: 'app-universo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './universo.component.html',
  styleUrl: './universo.component.css'
})
export class UniversoComponent implements OnInit {
  
  universoInfo: any;
  personagens: Character[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const nomeUniverso = params.get('nome');
      if (nomeUniverso) {
        this.carregarDados(nomeUniverso);
      }
    });
  }

  carregarDados(nome: string) {
    this.universoInfo = this.characterService.getUniverseInfo(nome);
    this.personagens = this.characterService.getCharactersByUniverse(nome);
  }

  voltarPagina() {
    this.location.back();
  }
}