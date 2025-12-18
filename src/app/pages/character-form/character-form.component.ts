import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CharacterService, Character } from '../../services/character.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from "../home/navbar.component";
import { MetadataService } from '../../services/metadata.service';

@Component({
  selector: 'app-character-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.css']
})
export class CharacterFormComponent implements OnInit {
  characterForm: FormGroup;
  isEditing: boolean = false;
  characterId: number | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  universes: string[] = [];
  types: string[] = [];
  powers: string[] = [];

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService,
    private route: ActivatedRoute,
    private router: Router,
    private metadataService: MetadataService
  ) {
    this.characterForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      alias: [''],
      universe: ['', Validators.required],
      type: ['', Validators.required],
      power: ['', Validators.required],
      image: ['', Validators.required],
      gif: [''],
      color: ['#000000'],
      symbol: [''],
      history: [''],
      powerLevel: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      affiliations: [[]],
      weaknesses: [[]],
      abilities: [[]],
      intelligence: [0, [Validators.min(0), Validators.max(7)]],
      strength: [0, [Validators.min(0), Validators.max(7)]],
      speed: [0, [Validators.min(0), Validators.max(7)]],
      durability: [0, [Validators.min(0), Validators.max(7)]],
      energyProjection: [0, [Validators.min(0), Validators.max(7)]],
      fightingSkills: [0, [Validators.min(0), Validators.max(7)]],
    });
  }

  ngOnInit(): void {
    this.metadataService.getUniverses().subscribe(data => this.universes = data);
    this.metadataService.getTypes().subscribe(data => this.types = data);
    this.metadataService.getPowers().subscribe(data => this.powers = data);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.characterId = +id;
        const character = this.characterService.getCharacterById(this.characterId);
        if (character) {
          this.characterForm.patchValue({
            ...character,
            affiliations: character.affiliations ? character.affiliations.join(', ') : '',
            weaknesses: character.weaknesses ? character.weaknesses.join(', ') : '',
            abilities: character.abilities ? character.abilities.join(', ') : '',
          });
          if (character.image) {
            this.imagePreview = character.image;
          }
        } else {
          console.warn(`Character with id ${this.characterId} not found.`);
          this.router.navigate(['/home']);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.characterForm.patchValue({ image: reader.result as string });
        this.characterForm.get('image')?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.characterForm.valid) {
      const formValue = this.characterForm.value;

      const character: Character = {
        ...formValue,
        affiliations: formValue.affiliations ? formValue.affiliations.split(',').map((s: string) => s.trim()) : [],
        weaknesses: formValue.weaknesses ? formValue.weaknesses.split(',').map((s: string) => s.trim()) : [],
        abilities: formValue.abilities ? formValue.abilities.split(',').map((s: string) => s.trim()) : [],
      };

      if (this.isEditing && this.characterId !== null) {
        this.characterService.updateCharacter(this.characterId, character);
      } else {

        this.characterService.addCharacter(character);
      }
      this.router.navigate(['/home']);
    } else {
      console.error('Form is invalid. Please check all fields.');
      this.markAllAsTouched(this.characterForm);
    }
  }

  markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/home']);
  }

  private toArray(value: string | string[]): string[] {
    if (Array.isArray(value)) {
      return value;
    }
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
}
