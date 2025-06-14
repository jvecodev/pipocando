export type BlogType = {
  id: string;
  title: string;
  content?: string;
  description?: string;
  author?: any;
  category?: string;
  tag?: string;
  imageUrl?: string;
  movieId?: number;
  serieId?: number;
}

// Tipos para integração com backend
export type PostRequest = {
  title: string;
  content: string;
  userId: number;
  movieId?: number;
  serieId?: number;
};

export type PostResponse = {
  id: number;
  title: string;
  content: string;
  userId: number;
  movieId?: number;
  serieId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Adicione outros campos retornados pelo backend se necessário
};