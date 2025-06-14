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
import { Search as SearchIcon } from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import TVShowCard from './TVShowCard';
import tmdbService, { TVShow, WatchProviders } from '../../services/tmdbService';

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

const Series: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [watchProviders, setWatchProviders] = useState<Record<number, WatchProviders | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteTVShows');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    loadTVShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, page]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadTVShows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadTVShows = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      switch (tabValue) {
        case 0:
          response = await tmdbService.getPopularTVShows(page);
          break;
        case 1:
          response = await tmdbService.getTopRatedTVShows(page);
          break;
        case 2:
          response = await tmdbService.getOnTheAirTVShows(page);
          break;
        default:
          response = await tmdbService.getPopularTVShows(page);
      }

      setTVShows(response.results);
      setTotalPages(response.total_pages);

      const providersPromises = response.results.map(async (tvShow) => {
        try {
          const providers = await tmdbService.getTVShowWatchProviders(tvShow.id);
          return { tvShowId: tvShow.id, providers };
        } catch (error) {
          return { tvShowId: tvShow.id, providers: null };
        }
      });

      const providersResults = await Promise.all(providersPromises);
      const providersMap: Record<number, WatchProviders | null> = {};
      
      providersResults.forEach(({ tvShowId, providers }) => {
        providersMap[tvShowId] = providers;
      });

      setWatchProviders(providersMap);
    } catch (err) {
      setError('Erro ao carregar séries. Verifique sua conexão e tente novamente.');
      console.error('Erro ao carregar séries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await tmdbService.searchTVShows(searchQuery, page);
      setTVShows(response.results);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError('Erro ao buscar séries. Tente novamente.');
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

  const handleFavoriteToggle = (tvShowId: number) => {
    const newFavorites = favorites.includes(tvShowId)
      ? favorites.filter(id => id !== tvShowId)
      : [...favorites, tvShowId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTVShows', JSON.stringify(newFavorites));
  };

  return (
    <MainLayout>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          📺 Séries
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Descubra onde assistir suas séries favoritas e adicione-as à sua lista de interesse
        </Typography>

        <TextField
          fullWidth
          placeholder="Buscar séries..."
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
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
            }
          }}
        />
      </Box>

      {!searchQuery && (
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: 1.5,
              },
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120,
              },
            }}
          >
            <Tab label="🔥 Populares" />
            <Tab label="⭐ Melhores Avaliadas" />
            <Tab label="📡 No Ar" />
          </Tabs>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} thickness={4} />
            <Typography color="text.secondary">
              Carregando séries...
            </Typography>
          </Stack>
        </Box>
      ) : (
        <>
          <TabPanel value={searchQuery ? 0 : tabValue} index={0}>
            <Grid container spacing={3}>
              {tvShows.map((tvShow) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={tvShow.id}>
                  <TVShowCard
                    tvShow={tvShow}
                    watchProviders={watchProviders[tvShow.id]}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.includes(tvShow.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {!searchQuery && (
            <>
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {tvShows.map((tvShow) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={tvShow.id}>
                      <TVShowCard
                        tvShow={tvShow}
                        watchProviders={watchProviders[tvShow.id]}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={favorites.includes(tvShow.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  {tvShows.map((tvShow) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={tvShow.id}>
                      <TVShowCard
                        tvShow={tvShow}
                        watchProviders={watchProviders[tvShow.id]}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={favorites.includes(tvShow.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </>
          )}

          {tvShows.length === 0 && !loading && (
            <Box textAlign="center" py={8}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                📺 Nenhuma série encontrada
              </Typography>
              <Typography color="text.secondary">
                {searchQuery 
                  ? `Tente uma busca diferente para "${searchQuery}"`
                  : 'Tente novamente mais tarde'
                }
              </Typography>
            </Box>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={6}>
              <Pagination
                count={Math.min(totalPages, 500)} 
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Series;
