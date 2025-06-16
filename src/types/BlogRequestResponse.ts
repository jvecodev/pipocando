export type BlogType = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: number;
  movieId?: number;
  serieId?: number;
  createdAt?: string;
  updatedAt?: string;
  author?: any;
  description?: string;
  imageUrl?: string;
  urlImage?: string;  // Campo adicionado para compatibilidade com o banco
  tmdbId?: number;
  tmdbType?: 'movie' | 'tv';
  tmdbData?: any;
}

export type PostRequest = {
  title: string;
  content: string;
  userId: number;
  category: string;
  movieId?: number;
  serieId?: number;
  urlImage?: string;  // Campo adicionado para compatibilidade com o banco
  imageUrl?: string;  // Campo para compatibilidade com a aplicação frontend
};

export type PostResponse = {
  id: number;
  title: string;
  content: string;
  userId: number;
  category: string;
  movieId?: number;
  serieId?: number;
  createdAt?: string;
  updatedAt?: string;
  urlImage?: string;  // Campo adicionado para compatibilidade com o banco
};
