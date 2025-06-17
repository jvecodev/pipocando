import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Star, 
  PlayArrow, 
  Add, 
  Remove,
  ShoppingCart,
  MovieCreation,
  YouTube
} from '@mui/icons-material';
import { Movie, WatchProviders, Video } from '../../services/tmdbService';
import tmdbService from '../../services/tmdbService';
import watchlistService from '../../services/watchlistService';

interface MovieCardProps {
  movie: Movie;
  watchProviders?: WatchProviders | null;
  onFavoriteToggle?: (movieId: number) => void;
  isFavorite?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  watchProviders,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailer, setTrailer] = useState<Video | null>(null);

  useEffect(() => {
    setIsInWatchlist(watchlistService.isInWatchlist(movie.id, 'movie'));
  }, [movie.id]);

  useEffect(() => {
    const handleWatchlistUpdate = () => {
      setIsInWatchlist(watchlistService.isInWatchlist(movie.id, 'movie'));
    };

    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
  }, [movie.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      watchlistService.removeFromWatchlist(movie.id, 'movie');
    } else {
      watchlistService.addToWatchlist(movie, 'movie');
    }
  };

  const handleTrailerClick = async () => {
    try {
      const videos = await tmdbService.getMovieVideos(movie.id);
      const foundTrailer = tmdbService.findOfficialTrailer(videos);
      
      if (foundTrailer) {
        setTrailer(foundTrailer);
        setTrailerOpen(true);
      } else {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer oficial')}`, '_blank');
      }
    } catch (error) {
      console.error('Erro ao buscar trailer:', error);
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer oficial')}`, '_blank');
    }
  };

  const hasStreamingOptions = watchProviders?.flatrate && watchProviders.flatrate.length > 0;  const renderStreamingProviders = () => {
    if (!watchProviders?.flatrate || watchProviders.flatrate.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Disponível em:
        </Typography>
        <Box
          sx={{
            py: 0.5,
            maxHeight: '70px',
            overflow: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
            },
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {watchProviders.flatrate.map((provider) => (
              <Chip
                key={provider.provider_id}
                label={provider.provider_name}
                size="small"
                color="success"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  my: 0.3
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    );
  };  const renderPurchaseOptions = () => {
    const year = getYear(movie.release_date);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {hasStreamingOptions ? 'Ou compre/alugue:' : 'Onde assistir:'}
        </Typography>
        <Box
          sx={{
            py: 0.5,
            maxHeight: '100px',
            overflow: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
            },
          }}
        >          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShoppingCart />}
              onClick={() => window.open(tmdbService.getGooglePlayMovieUrl(movie.title, year), '_blank')}
              sx={(theme) => ({ 
                justifyContent: 'flex-start',
                borderColor: theme.palette.mode === 'dark' ? '#fff' : '#424242',
                color: theme.palette.mode === 'dark' ? '#fff' : '#424242',
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? '#e0e0e0' : '#616161',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(66,66,66,0.04)',
                },
              })}
            >
              Alugar na Google Play
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<YouTube />}
              onClick={() => window.open(tmdbService.getYouTubeMovieUrl(movie.title, year), '_blank')}
              sx={(theme) => ({ 
                justifyContent: 'flex-start',
                borderColor: theme.palette.mode === 'dark' ? '#fff' : '#424242',
                color: theme.palette.mode === 'dark' ? '#fff' : '#424242',
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? '#e0e0e0' : '#616161',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(66,66,66,0.04)',
                },
              })}
            >
              Comprar no YouTube
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="300"
            image={
              movie.poster_path
                ? tmdbService.getImageUrl(movie.poster_path)
                : '/assets/img/no-image.png'
            }
            alt={movie.title}
            sx={{ objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Chip
              icon={<Star />}
              label={movie.vote_average.toFixed(1)}
              size="small"
              color="warning"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                '& .MuiChip-icon': { color: 'gold' },
              }}
            />
            {onFavoriteToggle && (
              <Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                <IconButton
                  size="small"
                  onClick={() => onFavoriteToggle(movie.id)}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                  }}
                >
                  {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista de interesse'}>
              <IconButton
                size="small"
                onClick={handleWatchlistToggle}
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                }}              >
                {isInWatchlist ? (
                  <Remove sx={(theme) => ({ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#424242'
                  })} />
                ) : (
                  <Add sx={(theme) => ({ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#424242'
                  })} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {movie.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatDate(movie.release_date)}
          </Typography>          <Box
            sx={{
              flexGrow: 1,
              mb: 2.5,
              px: 0.5,
              height: '120px',
              overflow: 'auto',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '10px',
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {movie.overview || 'Sem descrição disponível.'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {renderStreamingProviders()}
          
          {!hasStreamingOptions && renderPurchaseOptions()}          <Stack spacing={1} direction="row">
            {hasStreamingOptions && watchProviders?.link && (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                size="small"
                onClick={() => window.open(watchProviders.link, '_blank')}
                sx={(theme) => ({ 
                  flex: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                  color: theme.palette.mode === 'dark' ? '#424242' : '#fff',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#e0e0e0' : theme.palette.primary.dark,
                  },
                })}
              >
                Assistir
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<MovieCreation />}
              size="small"
              onClick={handleTrailerClick}
              sx={(theme) => ({ 
                flex: 1,
                borderColor: theme.palette.mode === 'dark' ? '#fff' : '#424242',
                color: theme.palette.mode === 'dark' ? '#fff' : '#424242',
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? '#e0e0e0' : '#616161',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(66,66,66,0.04)',
                },
              })}
            >
              Trailer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Dialog do Trailer */}
      <Dialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {trailer?.name || `Trailer - ${movie.title}`}
        </DialogTitle>
        <DialogContent>
          {trailer && (
            <Box
              sx={{
                position: 'relative',
                paddingBottom: '56.25%', 
                height: 0,
                overflow: 'hidden',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          )}
        </DialogContent>        <DialogActions>
          <Button 
            onClick={() => setTrailerOpen(false)}
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#fff' : '#424242',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(66,66,66,0.04)',
              },
            })}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MovieCard;
