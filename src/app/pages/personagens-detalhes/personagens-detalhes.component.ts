import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';

declare var lucide: any;

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit, AfterViewInit {
  
  personagem: Character | undefined;
  ehFavorito: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private location: Location
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.personagem = this.characterService.getCharacterById(id);
      
      if (this.personagem) {
        const favs = this.characterService.getFavorites();
        this.ehFavorito = favs.includes(this.personagem.id);
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
  }

  voltarPagina() {
    this.location.back();
  }

  toggleFavorito() {
    if (this.personagem) {
      this.characterService.toggleFavorite(this.personagem.id);
      this.ehFavorito = !this.ehFavorito;
    }
  }
}