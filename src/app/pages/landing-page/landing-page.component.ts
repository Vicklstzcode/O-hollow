import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Hero {
  name: string;
  power: string;
  color: string;
  image: string;
  description: string;
}

interface Slide {
  title: string;
  heading: string;
  tagline: string;
  description: string;
  image: string;
  gradient: string;
  showHeroes: boolean;
  showPortal: boolean;
  symbolImage?: string; // Add this line
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  currentSlide = signal(0);
  isExiting = signal(false);
  isReady = signal(false);

  constructor(private router: Router) {}
  
  ngOnInit(): void {
    setTimeout(() => this.isReady.set(true), 100);
  }

  heroes: Hero[] = [
    {
      name: 'Doctor Strange',
      power: 'Mago Supremo',
      color: 'from-orange-500 to-red-600',
      image: 'imagens/DoutorEstranho.jpg',
      description: 'Stephen Strange, um cirurgião arrogante que se tornou o Mago Supremo, protegendo a Terra de ameaças místicas e dimensionais.'
    },
    {
      name: 'Jean Grey',
      power: 'Fênix Cósmica',
      color: 'from-yellow-500 to-orange-600',
      image: 'imagens/jeangrey.jpg',
      description: 'Uma mutante nível Ômega com vastos poderes telepáticos e telecinéticos, hospedeira da Força Fênix, uma entidade cósmica de poder imensurável.'
    },
    {
      name: 'Ravena',
      power: 'Feiticeira Empata',
      color: 'from-purple-500 to-indigo-600',
      image: 'imagens/Ravena.jpg',
      description: 'Meio-demônio, meio-humana, Ravena luta para controlar suas emoções e seus imensos poderes sombrios, herdados de seu pai, o demônio Trigon.'
    },
    {
      name: 'John Constantine',
      power: 'Mestre do Ocultismo',
      color: 'from-amber-400 to-yellow-600',
      image: 'imagens/constatine.jpg',
      description: 'Um detetive do oculto cínico e experiente, que usa sua inteligência, conhecimento de magia e inúmeros truques para enfrentar os horrores do sobrenatural.'
    },
  ];

  slides: Slide[] = [
    {
      title: 'Bem-vindo ao Mysticos',
      heading: 'Onde Universos se Colidem',
      tagline: 'O santuário para heróis além do tempo e espaço.',
      description: 'Explore um nexo de realidades onde os mais poderosos seres místicos do multiverso se reúnem. Suas histórias, seus poderes, seus destinos, tudo em um só lugar.',
      image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
      gradient: 'from-purple-600 to-pink-600',
      showHeroes: false,
      showPortal: true,
      symbolImage: 'imagens/Loki.jpg', // Added
    },
    {
      title: 'Guardiões do Véu',
      heading: 'Conheça os Protetores',
      tagline: 'Lendas de mundos esquecidos e futuros distantes.',
      description: 'Feiticeiros, mutantes e mestres do oculto. Descubra os guardiões que protegem o equilíbrio das realidades.',
      image: 'https://images.unsplash.com/photo-1605704314239-063dab72ce35?q=80&w=1974&auto=format&fit=crop',
      gradient: 'from-pink-600 to-purple-600',
      showHeroes: true,
      showPortal: true,
    },
    {
      title: 'O Nexus Cósmico',
      heading: 'Mapeie as Conexões',
      tagline: 'Cada herói é um fio na teia do destino.',
      description: 'Navegue por um banco de dados interativo que revela as alianças, rivalidades e histórias compartilhadas entre os seres mais poderosos do multiverso.',
      image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1974&auto=format&fit=crop',
      gradient: 'from-cyan-600 to-purple-600',
      showHeroes: false,
      showPortal: false,
      symbolImage: 'imagens/Storm.jpg', // Added
    },
    {
      title: 'Seu Legado Começa',
      heading: 'Entre no Santuário',
      tagline: 'O multiverso aguarda sua descoberta.',
      description: 'Sua jornada está apenas começando. Entre, explore e encontre seu lugar entre as lendas.',
      image: 'https://images.unsplash.com/photo-1583594855037-33b7a5155650?q=80&w=2070&auto=format&fit=crop',
      gradient: 'from-purple-600 via-pink-600 to-cyan-600',
      showHeroes: false,
      showPortal: false,
      symbolImage: 'imagens/SabrinaSpellman.jpg', // Added
    },
  ];

  features = ['Explorar', 'Conectar', 'Descobrir'];
  orbIndices = Array.from({ length: 12 }, (_, i) => i);

  currentData = computed(() => this.slides[this.currentSlide()]);
  isLastSlide = computed(() => this.currentSlide() === this.slides.length - 1);

  nextSlide(): void {
    if (!this.isLastSlide()) {
        this.currentSlide.update(val => val + 1);
    } else {
        this.isExiting.set(true);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 500); // Match CSS animation duration
    }
  }

  previousSlide(): void {
    if (this.currentSlide() > 0) {
      this.currentSlide.update(val => val - 1);
    }
  }

  skipToEnd(): void {
    this.currentSlide.set(this.slides.length - 1);
  }

  getOrbPosition(index: number): { top: string; left: string; animationDelay: string; animationDuration: string } {
    const seed = index * 1234567;
    const random1 = (Math.sin(seed) * 10000) % 100;
    const random2 = (Math.cos(seed) * 10000) % 100;
    
    return {
      top: `${Math.abs(random1)}%`,
      left: `${Math.abs(random2)}%`,
      animationDelay: `${(index % 4) * 0.5}s`,
      animationDuration: `${5 + Math.abs((Math.cos(seed) * 10000) % 5)}s`
    };
  }

  getOrbColor(index: number): string {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-cyan-400 to-blue-400',
      'from-pink-400 to-purple-400',
      'from-yellow-400 to-orange-400'
    ];
    return colors[index % colors.length];
  }

  trackByIndex(index: number): number {
    return index;
  }
}
