import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Movie as MovieIcon,
  Whatshot as WhatshotIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  SentimentVeryDissatisfied as NoResultsIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import MovieCard from './MovieCard';
import tmdbService, { Movie, WatchProviders } from '../../services/tmdbService';
import { COLORS } from '../../shared-theme/colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Movies: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchProviders, setWatchProviders] = useState<Record<number, WatchProviders | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteMovies');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [tabValue, page]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadMovies();
    }
  }, [searchQuery]);

  const loadMovies = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      switch (tabValue) {
        case 0:
          response = await tmdbService.getPopularMovies(page);
          break;
        case 1:
          response = await tmdbService.getTopRatedMovies(page);
          break;
        case 2:
          response = await tmdbService.getUpcomingMovies(page);
          break;
        default:
          response = await tmdbService.getPopularMovies(page);
      }

      setMovies(response.results);
      setTotalPages(response.total_pages);

      const providersPromises = response.results.map(async (movie) => {
        try {
          const providers = await tmdbService.getMovieWatchProviders(movie.id);
          return { movieId: movie.id, providers };
        } catch (error) {
          return { movieId: movie.id, providers: null };
        }
      });

      const providersResults = await Promise.all(providersPromises);
      const providersMap: Record<number, WatchProviders | null> = {};
      
      providersResults.forEach(({ movieId, providers }) => {
        providersMap[movieId] = providers;
      });

      setWatchProviders(providersMap);
    } catch (err) {
      setError('Erro ao carregar filmes. Verifique sua conexão e tente novamente.');
      console.error('Erro ao carregar filmes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await tmdbService.searchMovies(searchQuery, page);
      setMovies(response.results);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError('Erro ao buscar filmes. Tente novamente.');
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    setSearchQuery('');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavoriteToggle = (movieId: number) => {
    const newFavorites = favorites.includes(movieId)
      ? favorites.filter(id => id !== movieId)
      : [...favorites, movieId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteMovies', JSON.stringify(newFavorites));
  };

  return (
    <MainLayout>      {/* Hero Section */}
      <Box sx={{ textAlign: 'left', mb: 6, mt: { xs: 6, md: 12 } }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', md: '4rem' },
            color: 'text.primary',
          }}
        >
          Filmes
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ fontWeight: 500, maxWidth: 800, mb: 4 }}
        >
          Descubra onde assistir seus filmes favoritos e adicione-os à sua lista de interesse.
        </Typography>
        <TextField
          fullWidth
          placeholder="Buscar filmes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "background.paper",
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
          {/* Botões podem ser personalizados conforme necessidade */}
        </Box>
      </Box>

      {/* Tabs Navigation */}
      {!searchQuery && (
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered={false}            sx={(theme) => ({
              justifyContent: 'flex-start',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'flex-start',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                height: 3,
                borderRadius: 1.5,
              },              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120,
                color: 'text.primary',
                alignItems: 'flex-start',
                transition: 'none',
              },
            })}
          >
            <Tab 
              icon={<WhatshotIcon />} 
              label="Populares" 
              iconPosition="start"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              icon={<StarIcon />} 
              label="Melhores Avaliados" 
              iconPosition="start"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Em Breve" 
              iconPosition="start"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} thickness={4} />
            <Typography color="text.secondary">
              Carregando filmes...
            </Typography>
          </Stack>
        </Box>
      ) : (
        <>
          <TabPanel value={searchQuery ? 0 : tabValue} index={0}>
            <Grid container spacing={3}>
              {movies.map((movie) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={movie.id}>
                  <MovieCard
                    movie={movie}
                    watchProviders={watchProviders[movie.id]}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.includes(movie.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {!searchQuery && (
            <>
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {movies.map((movie) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={movie.id}>
                      <MovieCard
                        movie={movie}
                        watchProviders={watchProviders[movie.id]}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={favorites.includes(movie.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  {movies.map((movie) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={movie.id}>
                      <MovieCard
                        movie={movie}
                        watchProviders={watchProviders[movie.id]}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={favorites.includes(movie.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </>
          )}          {/* Empty State */}
          {movies.length === 0 && !loading && (
            <Box textAlign="center" py={8}>
              <NoResultsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Nenhum filme encontrado
              </Typography>
              <Typography color="text.secondary">
                {searchQuery 
                  ? `Tente uma busca diferente para "${searchQuery}"`
                  : 'Tente novamente mais tarde'
                }
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={6}>              <Pagination
                count={Math.min(totalPages, 500)} // TMDB limita a 500 páginas
                page={page}
                onChange={handlePageChange}
                size="large"
                sx={(theme) => ({
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  },
                  '& .Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.palette.primary.main,
                    color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                  },
                })}
              />
            </Box>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Movies;
