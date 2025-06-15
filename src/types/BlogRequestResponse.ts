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
};
