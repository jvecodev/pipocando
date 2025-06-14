// Enum de categorias para posts
export enum CategoriaPostEnum {
  FILME = 'Filmes',
  SERIE = 'Séries',
}

export type Movie = {
  id: number;
  title: string;
};

export type Serie = {
  id: number;
  title: string;
};
