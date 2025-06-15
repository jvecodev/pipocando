import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import MovieCard from './MovieCard';
import tmdbService, { Movie, WatchProviders } from '../../services/tmdbService';

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
    // Carregar favoritos do localStorage
    const savedFavorites = localStorage.getItem('favoriteMovies');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  useEffect(() => {
    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, page]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadMovies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Carregar provedores de streaming para os filmes
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
      setError('Erro ao carregar filmes. Tente novamente.');
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
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Filmes
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Descubra onde assistir seus filmes favoritos
        </Typography>

        <Box sx={{ mb: 4 }}>
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
            sx={{ mb: 2 }}
          />

          {!searchQuery && (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab label="Populares" />
              <Tab label="Melhores Avaliados" />
              <Tab label="Em Breve" />
            </Tabs>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={searchQuery ? 0 : tabValue} index={0}>
              <Grid container spacing={3}>
                {movies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
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
                      <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
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
                      <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
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
            )}

            {movies.length === 0 && !loading && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  Nenhum filme encontrado.
                </Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={Math.min(totalPages, 500)} // TMDB limita a 500 páginas
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </MainLayout>
  );
};

export default Movies;
