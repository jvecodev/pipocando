import { Movie, TVShow } from './tmdbService';

export interface WatchlistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  addedAt: string;
}

class WatchlistService {
  private readonly STORAGE_KEY = 'pipocando_watchlist';

  // Obter lista completa
  getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar lista de interesse:', error);
      return [];
    }
  }

  // Adicionar item à lista
  addToWatchlist(item: Movie | TVShow, type: 'movie' | 'tv'): boolean {
    try {
      const watchlist = this.getWatchlist();
      
      // Verificar se já existe
      if (this.isInWatchlist(item.id, type)) {
        return false;
      }

      const watchlistItem: WatchlistItem = {
        id: item.id,
        type,
        title: type === 'movie' ? (item as Movie).title : (item as TVShow).name,
        poster_path: item.poster_path,
        overview: item.overview,
        vote_average: item.vote_average,
        addedAt: new Date().toISOString(),
      };

      watchlist.push(watchlistItem);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(watchlist));
      
      // Disparar evento customizado para notificar componentes
      window.dispatchEvent(new CustomEvent('watchlistUpdated', { 
        detail: { action: 'add', item: watchlistItem } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar à lista de interesse:', error);
      return false;
    }
  }

  // Remover item da lista
  removeFromWatchlist(id: number, type: 'movie' | 'tv'): boolean {
    try {
      const watchlist = this.getWatchlist();
      const filteredList = watchlist.filter(item => !(item.id === id && item.type === type));
      
      if (filteredList.length === watchlist.length) {
        return false; // Item não estava na lista
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredList));
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('watchlistUpdated', { 
        detail: { action: 'remove', id, type } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao remover da lista de interesse:', error);
      return false;
    }
  }

  // Verificar se item está na lista
  isInWatchlist(id: number, type: 'movie' | 'tv'): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.id === id && item.type === type);
  }

  // Obter contagem de itens
  getWatchlistCount(): number {
    return this.getWatchlist().length;
  }

  // Limpar toda a lista
  clearWatchlist(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('watchlistUpdated', { 
      detail: { action: 'clear' } 
    }));
  }

  // Obter apenas filmes
  getMoviesFromWatchlist(): WatchlistItem[] {
    return this.getWatchlist().filter(item => item.type === 'movie');
  }

  // Obter apenas séries
  getTVShowsFromWatchlist(): WatchlistItem[] {
    return this.getWatchlist().filter(item => item.type === 'tv');
  }

  // Exportar lista (para backup)
  exportWatchlist(): string {
    return JSON.stringify(this.getWatchlist(), null, 2);
  }

  // Importar lista (para restore)
  importWatchlist(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        localStorage.setItem(this.STORAGE_KEY, data);
        window.dispatchEvent(new CustomEvent('watchlistUpdated', { 
          detail: { action: 'import' } 
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar lista:', error);
      return false;
    }
  }
}

const watchlistService = new WatchlistService();
export default watchlistService;
