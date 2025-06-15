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
  createdAt?: string;
  updatedAt?: string;
  tmdbId?: number;
  tmdbType?: 'movie' | 'tv';
  tmdbData?: any;
  postType?: 'news' | 'review' | 'listicle' | 'general'; 
  featured?: boolean; 
  rating?: number; 
}

export type PostRequest = {
  title: string;
  content: string;
  userId: number;
  movieId?: number;
  serieId?: number;
  tmdbId?: number;
  tmdbType?: 'movie' | 'tv';
  tmdbData?: any;
  postType?: 'news' | 'review' | 'listicle' | 'general';
  featured?: boolean;
  rating?: number;
};

export type PostResponse = {
  id: number;
  title: string;
  content: string;
  userId: number;
  movieId?: number;
  serieId?: number;
  tmdbId?: number;
  tmdbType?: 'movie' | 'tv';
  tmdbData?: any;
  postType?: 'news' | 'review' | 'listicle' | 'general';
  featured?: boolean;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
};

export enum PostTypeEnum {
  NEWS = 'news',
  REVIEW = 'review', 
  LISTICLE = 'listicle',
  GENERAL = 'general'
}

export const POST_TYPE_LABELS = {
  [PostTypeEnum.NEWS]: 'Notícias',
  [PostTypeEnum.REVIEW]: 'Resenhas',
  [PostTypeEnum.LISTICLE]: 'Listas',
  [PostTypeEnum.GENERAL]: 'Geral'
};