import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';

// Declarações externas (Chart.js e Lucide)
declare var Chart: any;
declare var lucide: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  // KPIs (Indicadores)
  totalEntidades: number = 0;
  ameacasAtivas: number = 0;
  novosRegistros: number = 0;
  universosMonitorados: number = 0;
  listaUniversos: string = '';

  // Dados para a Tabela
  atividadesRecentes: any[] = [];

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    this.calcularMetricas();
    this.gerarTabela();
  }

  ngAfterViewInit() {
    // Inicia ícones e gráficos DEPOIS que o HTML carrega
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
      this.renderizarGraficos();
    }, 100);
  }

  calcularMetricas() {
    const todos = this.characterService.getCharacters();
    
    this.totalEntidades = todos.length;
    // Ameaças: Poder >= 95
    this.ameacasAtivas = todos.filter(c => c.powerLevel >= 95).length;
    // Novos: ID > 5 (Simulação)
    this.novosRegistros = todos.filter(c => c.id > 5).length;
    
    const unis = [...new Set(todos.map(c => c.universe))];
    this.universosMonitorados = unis.length;
    this.listaUniversos = unis.join(', ');
  }

  gerarTabela() {
    const todos = this.characterService.getCharacters();
    // Ordena por poder e pega os 5 mais fortes
    this.atividadesRecentes = todos
      .sort((a, b) => b.powerLevel - a.powerLevel)
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

  renderizarGraficos() {
    const todos = this.characterService.getCharacters();
    if (!todos.length) return;

    // --- GRÁFICO 1: Barras (Energia Média por Universo) ---
    const unis = [...new Set(todos.map(c => c.universe))];
    const mediaPoder = unis.map(u => {
      const chars = todos.filter(c => c.universe === u);
      const total = chars.reduce((sum, c) => sum + c.powerLevel, 0);
      return Math.round(total / chars.length);
    });

    const ctxEnergy = document.getElementById('energyChart') as HTMLCanvasElement;
    if (ctxEnergy) {
      new Chart(ctxEnergy, {
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
    // Conta quantos de cada tipo existem
    const tiposMap: any = {};
    todos.forEach(c => {
        const tipo = c.type || 'Outros';
        tiposMap[tipo] = (tiposMap[tipo] || 0) + 1;
    });
    
    const labelsTipos = Object.keys(tiposMap);
    const dataTipos = Object.values(tiposMap);

    const ctxSpecies = document.getElementById('speciesChart') as HTMLCanvasElement;
    if (ctxSpecies) {
      new Chart(ctxSpecies, {
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
}