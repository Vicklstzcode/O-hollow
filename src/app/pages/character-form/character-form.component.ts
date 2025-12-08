import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CharacterService, Character } from '../../services/character.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from "../home/navbar.component";
import { MetadataService } from '../../services/metadata.service'; // Import MetadataService

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
  
  // Dynamic data for categories
  universes: string[] = [];
  types: string[] = [];
  powers: string[] = [];

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService,
    private route: ActivatedRoute,
    private router: Router,
    private metadataService: MetadataService // Inject MetadataService
  ) {
    this.characterForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      alias: [''],
      universe: ['', Validators.required],
      type: ['', Validators.required],
      power: ['', Validators.required],
      image: ['', Validators.required], // Should be a URL or path
      gif: [''], // Optional
      color: ['#000000'], // Default color
      symbol: [''], // Optional
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
    // Fetch dynamic data from MetadataService
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
          // Flatten array fields for form display if needed, or handle in custom controls
          this.characterForm.patchValue({
            ...character,
            affiliations: character.affiliations ? character.affiliations.join(', ') : '',
            weaknesses: character.weaknesses ? character.weaknesses.join(', ') : '',
            abilities: character.abilities ? character.abilities.join(', ') : '',
          });
        } else {
          console.warn(`Character with id ${this.characterId} not found.`);
          // Optionally redirect or show an error
          this.router.navigate(['/home']); // Redirect to home if character not found
        }
      }
    });
  }

  onSubmit(): void {
    if (this.characterForm.valid) {
      const formValue = this.characterForm.value;
      
      // Convert comma-separated strings back to arrays
      const character: Character = {
        ...formValue,
        affiliations: formValue.affiliations ? formValue.affiliations.split(',').map((s: string) => s.trim()) : [],
        weaknesses: formValue.weaknesses ? formValue.weaknesses.split(',').map((s: string) => s.trim()) : [],
        abilities: formValue.abilities ? formValue.abilities.split(',').map((s: string) => s.trim()) : [],
      };

      if (this.isEditing && this.characterId !== null) {
        // Update existing character
        this.characterService.updateCharacter(this.characterId, character);
      } else {
        // Add new character
        this.characterService.addCharacter(character);
      }
      this.router.navigate(['/home']); // Redirect to home after submission
    } else {
      // Optionally show validation errors
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
    this.router.navigate(['/home']); // Navigate to the home page
  }

  // Helper to convert comma-separated string to array
  private toArray(value: string | string[]): string[] {
    if (Array.isArray(value)) {
      return value;
    }
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
}
