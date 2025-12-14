import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';
import { NavbarComponent } from "../home/navbar.component";

// Declarações externas (Chart.js e Lucide)
declare var Chart: any;
declare var lucide: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  
  private charactersSubscription: Subscription | undefined;
  private energyChart: any;
  private speciesChart: any;
  private allCharacters: Character[] = [];

  totalEntidades: number = 0;
  ameacasAtivas: number = 0;
  novosRegistros: number = 0;
  universosMonitorados: number = 0;
  listaUniversos: string = '';
  atividadesRecentes: any[] = [];

  constructor(
    private characterService: CharacterService,
    private location: Location
  ) {}

  ngOnInit() {
    this.charactersSubscription = this.characterService.getCharactersObservable().subscribe(characters => {
      this.allCharacters = characters;
      this.atualizarDashboard();
    });
  }

  ngOnDestroy() {
    if (this.charactersSubscription) {
      this.charactersSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
  }

  private atualizarDashboard() {
    this.calcularMetricas();
    this.gerarTabela();
    setTimeout(() => this.renderizarGraficos(), 0);
    setTimeout(() => lucide.createIcons(), 100);
  }

  private calcularMetricas() {
    this.totalEntidades = this.allCharacters.length;
    this.ameacasAtivas = this.allCharacters.filter(c => c.powerLevel >= 95).length;
    this.novosRegistros = this.allCharacters.filter(c => c.id > 5).length;
    
    const unis = [...new Set(this.allCharacters.map(c => c.universe))];
    this.universosMonitorados = unis.length;
    this.listaUniversos = unis.join(', ');
  }

  private gerarTabela() {
    const sorted = [...this.allCharacters].sort((a, b) => b.powerLevel - a.powerLevel);
    this.atividadesRecentes = sorted
      .slice(0, 5)
      .map(char => {
        const danger = this.getNivelPerigo(char.powerLevel);
        return {
          ...char,
          status: 'Ativo', 
          statusClass: 'text-green-400 bg-green-500/10',
          dangerText: danger.text,
          dangerClass: danger.class,
          dangerBarClass: danger.barClass
        };
      });
  }

  getNivelPerigo(power: number) {
    if (power >= 98) return { text: "Cósmico", class: "bg-purple-500/10 text-purple-400", barClass: "bg-purple-500" };
    if (power >= 95) return { text: "Extremo", class: "bg-red-500/10 text-red-400", barClass: "bg-red-500" };
    if (power >= 90) return { text: "Alto", class: "bg-amber-500/10 text-amber-400", barClass: "bg-amber-500" };
    return { text: "Moderado", class: "bg-blue-500/10 text-blue-400", barClass: "bg-blue-500" };
  }

  private renderizarGraficos() {
    console.log('DashboardComponent: renderizarGraficos called. Type of Chart:', typeof Chart);
    if (!this.allCharacters.length || typeof Chart === 'undefined') return;

    this.energyChart?.destroy();
    this.speciesChart?.destroy();
    
    // --- GRÁFICO 1: Barras (Poder Médio por Universo) ---
    const unis = [...new Set(this.allCharacters.map(c => c.universe))];
    const mediaPoder = unis.map(u => {
      const chars = this.allCharacters.filter(c => c.universe === u);
      if (chars.length === 0) return 0;
      const total = chars.reduce((sum, c) => sum + c.powerLevel, 0);
      return Math.round(total / chars.length);
    });

    const ctxEnergy = document.getElementById('energyChart') as HTMLCanvasElement;
    if (ctxEnergy) {
      this.energyChart = new Chart(ctxEnergy, {
        type: 'bar',
        data: {
          labels: unis,
          datasets: [{
            label: 'Poder Médio',
            data: mediaPoder,
            backgroundColor: 'rgba(168, 85, 247, 0.6)',
            borderColor: '#a855f7',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "gray" } },
            x: { grid: { display: false }, ticks: { color: "gray" } }
          }
        }
      });
    }

    // --- GRÁFICO 2: Pizza (Tipos) ---
    const tiposMap: any = {};
    this.allCharacters.forEach(c => {
        const tipo = c.type || 'Outros';
        tiposMap[tipo] = (tiposMap[tipo] || 0) + 1;
    });
    
    const labelsTipos = Object.keys(tiposMap);
    const dataTipos = Object.values(tiposMap);

    const ctxSpecies = document.getElementById('speciesChart') as HTMLCanvasElement;
    if (ctxSpecies) {
      this.speciesChart = new Chart(ctxSpecies, {
        type: 'doughnut',
        data: {
          labels: labelsTipos,
          datasets: [{
            data: dataTipos,
            backgroundColor: ['#a855f7', '#06b6d4', '#eab308', '#ef4444', '#22c55e'],
            borderColor: 'transparent'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
        }
      });
    }
  }

  voltarPagina() {
    this.location.back();
  }
}