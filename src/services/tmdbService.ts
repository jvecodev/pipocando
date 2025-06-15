import axios from 'axios';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'sua_chave_aqui';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProviders {
  flatrate?: WatchProvider[];
  buy?: WatchProvider[];
  rent?: WatchProvider[];
  link?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  production_companies: any[];
  videos?: { results: Video[] };
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  videos?: { results: Video[] };
}

class TMDBService {
  private api = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
      api_key: TMDB_API_KEY,
      language: 'pt-BR',
      region: 'BR'
    }
  });

  async getPopularMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await this.api.get('/movie/popular', { params: { page } });
    return response.data as { results: Movie[]; total_pages: number };
  }

  async getTopRatedMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await this.api.get('/movie/top_rated', { params: { page } });
    return response.data as { results: Movie[]; total_pages: number };
  }

  async getUpcomingMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await this.api.get('/movie/upcoming', { params: { page } });
    return response.data as { results: Movie[]; total_pages: number };
  }

  async searchMovies(query: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await this.api.get('/search/movie', { params: { query, page } });
    return response.data as { results: Movie[]; total_pages: number };
  }

  async getMovieWatchProviders(movieId: number): Promise<WatchProviders | null> {
    try {
      const response = await this.api.get(`/movie/${movieId}/watch/providers`);
      return (response.data as any).results?.BR || null;
    } catch (error) {
      console.error('Erro ao buscar provedores de streaming:', error);
      return null;
    }
  }

  async getPopularTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    const response = await this.api.get('/tv/popular', { params: { page } });
    return response.data as { results: TVShow[]; total_pages: number };
  }

  async getTopRatedTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    const response = await this.api.get('/tv/top_rated', { params: { page } });
    return response.data as { results: TVShow[]; total_pages: number };
  }

  async getOnTheAirTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    const response = await this.api.get('/tv/on_the_air', { params: { page } });
    return response.data as { results: TVShow[]; total_pages: number };
  }

  async searchTVShows(query: string, page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    const response = await this.api.get('/search/tv', { params: { query, page } });
    return response.data as { results: TVShow[]; total_pages: number };
  }

  async getTVShowWatchProviders(tvId: number): Promise<WatchProviders | null> {
    try {
      const response = await this.api.get(`/tv/${tvId}/watch/providers`);
      return (response.data as any).results?.BR || null;
    } catch (error) {
      console.error('Erro ao buscar provedores de streaming:', error);
      return null;
    }
  }

  async getMovieGenres(): Promise<Genre[]> {
    const response = await this.api.get('/genre/movie/list');
    return (response.data as any).genres;
  }

  async getTVGenres(): Promise<Genre[]> {
    const response = await this.api.get('/genre/tv/list');
    return (response.data as any).genres;
  }

  // Métodos para detalhes e trailers
  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    const response = await this.api.get(`/movie/${movieId}`, {
      params: { append_to_response: 'videos' }
    });
    return response.data as MovieDetails;
  }

  async getTVShowDetails(tvId: number): Promise<TVShowDetails> {
    const response = await this.api.get(`/tv/${tvId}`, {
      params: { append_to_response: 'videos' }
    });
    return response.data as TVShowDetails;
  }

  async getMovieVideos(movieId: number): Promise<Video[]> {
    try {
      const response = await this.api.get(`/movie/${movieId}/videos`);
      return (response.data as any).results || [];
    } catch (error) {
      console.error('Erro ao buscar vídeos do filme:', error);
      return [];
    }
  }

  async getTVShowVideos(tvId: number): Promise<Video[]> {
    try {
      const response = await this.api.get(`/tv/${tvId}/videos`);
      return (response.data as any).results || [];
    } catch (error) {
      console.error('Erro ao buscar vídeos da série:', error);
      return [];
    }
  }

  // Utilitários para links de compra/aluguel
  getGooglePlayMovieUrl(movieTitle: string, year?: string): string {
    const searchTerm = year ? `${movieTitle} ${year}` : movieTitle;
    return `https://play.google.com/store/search?q=${encodeURIComponent(searchTerm)}&c=movies`;
  }

  getYouTubeMovieUrl(movieTitle: string, year?: string): string {
    const searchTerm = year ? `${movieTitle} ${year}` : movieTitle;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + ' comprar filme')}`;
  }

  getTrailerUrl(video: Video): string {
    if (video.site === 'YouTube') {
      return `https://www.youtube.com/watch?v=${video.key}`;
    }
    return '';
  }

  findOfficialTrailer(videos: Video[]): Video | null {
    // Procura por trailer oficial em português primeiro
    const portugueseTrailer = videos.find(video => 
      video.type === 'Trailer' && 
      video.official && 
      video.site === 'YouTube' &&
      (video.name.toLowerCase().includes('português') || 
       video.name.toLowerCase().includes('brazilian') ||
       video.name.toLowerCase().includes('brasil'))
    );
    
    if (portugueseTrailer) return portugueseTrailer;

    // Se não encontrar em português, procura qualquer trailer oficial
    const officialTrailer = videos.find(video => 
      video.type === 'Trailer' && 
      video.official && 
      video.site === 'YouTube'
    );
    
    if (officialTrailer) return officialTrailer;

    // Como último recurso, qualquer trailer
    return videos.find(video => 
      video.type === 'Trailer' && 
      video.site === 'YouTube'
    ) || null;
  }

  getImageUrl(path: string): string {
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  }

  getFullImageUrl(path: string): string {
    return `https://image.tmdb.org/t/p/original${path}`;
  }
}

const tmdbService = new TMDBService();
export default tmdbService;
