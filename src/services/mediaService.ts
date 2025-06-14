import { Movie, Serie } from '../types/CategoriaPostEnum';

// Simulação de fetch de filmes
export async function fetchMovies(): Promise<Movie[]> {
  // Aqui você pode integrar com sua API real
  return [
    { id: 1, title: 'Filme Exemplo 1' },
    { id: 2, title: 'Filme Exemplo 2' },
  ];
}

// Simulação de fetch de séries
export async function fetchSeries(): Promise<Serie[]> {
  // Aqui você pode integrar com sua API real
  return [
    { id: 1, title: 'Série Exemplo 1' },
    { id: 2, title: 'Série Exemplo 2' },
  ];
}
