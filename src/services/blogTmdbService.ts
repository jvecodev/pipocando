import tmdbService, { Movie, TVShow } from './tmdbService';
import { BlogType } from '../types/BlogRequestResponse';
import watchlistService from './watchlistService';

// Utilitários para criar posts baseados em dados do TMDB
export async function createNewsFromMovie(movie: Movie): Promise<Partial<BlogType>> {
  const movieDetails = await tmdbService.getMovieDetails(movie.id);
  const genres = movieDetails.genres?.map(g => g.name).join(', ') || '';
  const trailer = movieDetails.videos?.results ? tmdbService.findOfficialTrailer(movieDetails.videos.results) : null;
    return {
    title: `${movie.title}: Novidades e Estreia`,
    content: `
# ${movie.title}

*Data de lançamento: ${formatDate(movie.release_date)}*
*Gêneros: ${genres}*

## Sinopse
${movie.overview || 'Sinopse indisponível.'}

## Novidades
Este filme acaba de chegar ao catálogo! Não perca a chance de conferir uma das mais recentes produções.

${trailer ? `\n\n**Confira o trailer oficial:** [Assistir no YouTube](${tmdbService.getTrailerUrl(trailer)})` : ''}
    `,
    category: 'Filmes',
    movieId: movie.id,
    tmdbId: movie.id,
    tmdbType: 'movie',
    tmdbData: movie,
    imageUrl: movie.poster_path ? tmdbService.getImageUrl(movie.poster_path) : undefined
  };
}

export async function createNewsFromTVShow(tvShow: TVShow): Promise<Partial<BlogType>> {
  const tvDetails = await tmdbService.getTVShowDetails(tvShow.id);
  const genres = tvDetails.genres?.map(g => g.name).join(', ') || '';
  const trailer = tvDetails.videos?.results ? tmdbService.findOfficialTrailer(tvDetails.videos.results) : null;
  return {
    title: `${tvShow.name}: Novidades e Lançamento`,
    content: `
# ${tvShow.name}

*Primeira exibição: ${formatDate(tvShow.first_air_date)}*
*Gêneros: ${genres}*
*Temporadas: ${tvDetails.number_of_seasons || 'N/A'}*

## Sinopse
${tvShow.overview || 'Sinopse indisponível.'}

## Novidades
Esta série acaba de ser adicionada ao catálogo! Com ${tvDetails.number_of_episodes || 'vários'} episódios distribuídos em ${tvDetails.number_of_seasons || 'algumas'} temporadas.

${trailer ? `\n\n**Confira o trailer oficial:** [Assistir no YouTube](${tmdbService.getTrailerUrl(trailer)})` : ''}
    `,
    category: 'Séries',
    serieId: tvShow.id,
    tmdbId: tvShow.id,
    tmdbType: 'tv',
    tmdbData: tvShow,
    imageUrl: tvShow.poster_path ? tmdbService.getImageUrl(tvShow.poster_path) : undefined
  };
}

export async function createReviewTemplate(type: 'movie' | 'tv', id: number): Promise<Partial<BlogType>> {
  if (type === 'movie') {
    const movie = await tmdbService.getMovieDetails(id);
    return {
      title: `Crítica: ${movie.title}`,
      content: `
# ${movie.title} - Crítica

![${movie.title}](${movie.poster_path ? tmdbService.getImageUrl(movie.poster_path) : ''})

*Lançamento: ${formatDate(movie.release_date)}*
*Duração: ${movie.runtime} minutos*

## Sinopse
${movie.overview || 'Sinopse indisponível.'}

## Análise
[Escreva sua análise aqui]

## Pontos Fortes
- 
- 
- 

## Pontos Fracos
- 
- 
- 

## Conclusão
[Escreva sua conclusão aqui]

## Nota
[Sua nota de 0-10]/10
      `,
      category: 'Filmes',      movieId: movie.id,
      tmdbId: movie.id,
      tmdbType: 'movie',
      tmdbData: movie,
      imageUrl: movie.poster_path ? tmdbService.getImageUrl(movie.poster_path) : undefined
    };
  } else {
    const tvShow = await tmdbService.getTVShowDetails(id);
    return {
      title: `Crítica: ${tvShow.name}`,
      content: `
# ${tvShow.name} - Crítica

![${tvShow.name}](${tvShow.poster_path ? tmdbService.getImageUrl(tvShow.poster_path) : ''})

*Estreia: ${formatDate(tvShow.first_air_date)}*
*Temporadas: ${tvShow.number_of_seasons}*
*Episódios: ${tvShow.number_of_episodes}*

## Sinopse
${tvShow.overview || 'Sinopse indisponível.'}

## Análise
[Escreva sua análise aqui]

## Pontos Fortes
- 
- 
- 

## Pontos Fracos
- 
- 
- 

## Conclusão
[Escreva sua conclusão aqui]

## Nota
[Sua nota de 0-10]/10
      `,
      category: 'Séries',      serieId: tvShow.id,
      tmdbId: tvShow.id,
      tmdbType: 'tv',
      tmdbData: tvShow,
      imageUrl: tvShow.poster_path ? tmdbService.getImageUrl(tvShow.poster_path) : undefined
    };
  }
}

// Cria template para listas de filmes/séries
export function createListicleTemplate(title: string, type: 'movie' | 'tv' | 'mixed'): Partial<BlogType> {
  const category = type === 'movie' ? 'Filmes' : 
                 type === 'tv' ? 'Séries' : 
                 'Filmes e Séries';
  
  return {
    title: title,
    content: `
# ${title}

![Imagem Destaque](https://via.placeholder.com/800x400?text=Listicle)

## Introdução
[Escreva uma introdução para sua lista]

## Os Itens

### 1. [Nome do Primeiro Item]
[Descrição]

### 2. [Nome do Segundo Item]
[Descrição]

### 3. [Nome do Terceiro Item]
[Descrição]

### 4. [Nome do Quarto Item]
[Descrição]

### 5. [Nome do Quinto Item]
[Descrição]

## Conclusão
[Faça um fechamento da sua lista]
    `,    category
  };
}

// Gerar sugestões de posts baseados na watchlist do usuário
export async function generateWatchlistPostSuggestions(): Promise<{
  reviewSuggestions: Array<{ item: any, type: 'movie' | 'tv' }>,
  listSuggestions: Array<{ theme: string, type: 'movie' | 'tv' }>
}> {
  const watchlist = watchlistService.getWatchlist();
  
  // Sugerir reviews dos 3 itens mais recentes da watchlist
  const sortedItems = [...watchlist].sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  ).slice(0, 3);
  
  const reviewSuggestions = sortedItems.map(item => ({
    item,
    type: item.type as 'movie' | 'tv'
  }));
  
  // Sugerir listas baseadas nos gêneros mais comuns
  const listSuggestions = [
    { theme: 'Melhores do Ano', type: 'movie' as const },
    { theme: 'Séries Imperdíveis', type: 'tv' as const },
    { theme: 'Clássicos do Cinema', type: 'movie' as const },
    { theme: 'Séries de Suspense', type: 'tv' as const },
  ];
  
  return {
    reviewSuggestions,
    listSuggestions
  };
}

// Funções utilitárias
function formatDate(dateString?: string): string {
  if (!dateString) return 'Data não informada';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Data inválida';
  }
}
