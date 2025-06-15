import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import AddIcon from '@mui/icons-material/Add';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import TvIcon from '@mui/icons-material/Tv';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { createPost, deletePost, searchPosts, updatePost, canEditPost, canDeletePost } from '../../services/blogService';
import { BlogType } from '../../types/BlogRequestResponse';
import { useUser } from '../../context/UserContext';
import StandardModal from '../../organisms/dialog/StandardModal';
import DeleteConfirmationModal from '../../organisms/dialog/DeleteConfirmationModal';
import PostForm from './PostForm';
import BlogCardItem from './BlogCardItem';
import tmdbService, { Movie, TVShow } from '../../services/tmdbService';
import watchlistService from '../../services/watchlistService';
import { createNewsFromMovie, createNewsFromTVShow, createReviewTemplate } from '../../services/blogTmdbService';
import { generateWatchlistPostSuggestions } from '../../services/blogTmdbService';
import { useNavigate } from 'react-router-dom';

// Categorias disponíveis
const CATEGORIES = [
  { label: 'Todas as categorias', value: 'all' },
  { label: 'Filmes', value: 'Filmes' },
  { label: 'Séries', value: 'Séries' },
];

const ITEMS_PER_PAGE = 6; // Número de itens por página

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente para as abas
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`blog-tabpanel-${index}`}
      aria-labelledby={`blog-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `blog-tab-${index}`,
    'aria-controls': `blog-tabpanel-${index}`,
  };
}

export default function Content() {
  const [posts, setPosts] = React.useState<BlogType[]>([]);
  const [focusedCardIndex] = React.useState<number | null>(null);
  const { user } = useUser(); 
  const navigate = useNavigate();
  const [category, setCategory] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [tabIndex, setTabIndex] = React.useState(0);
  
  const [trendingMovies, setTrendingMovies] = React.useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = React.useState<TVShow[]>([]);
  const [loadingTrending, setLoadingTrending] = React.useState<boolean>(false);
  const [watchlistSuggestions, setWatchlistSuggestions] = React.useState<{
    reviewSuggestions: Array<{ item: any, type: 'movie' | 'tv' }>,
    listSuggestions: Array<{ theme: string, type: 'movie' | 'tv' }>
  } | null>(null);

  const [modal, setModal] = React.useState<{
    open: boolean;
    type: 'create' | 'edit' | 'delete' | null;
    post?: BlogType | null;
  }>({ open: false, type: null, post: null });
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [postToDelete, setPostToDelete] = React.useState<BlogType | null>(null);

  React.useEffect(() => {
    const loadTrending = async () => {
      setLoadingTrending(true);
      try {
        const movieResults = await tmdbService.getPopularMovies();
        setTrendingMovies(movieResults.results);
        
        const tvResults = await tmdbService.getPopularTVShows();
        setTrendingTVShows(tvResults.results);
        
        const suggestions = await generateWatchlistPostSuggestions();
        setWatchlistSuggestions(suggestions);
        
      } catch (error) {
        console.error("Erro ao carregar tendências:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    if (tabIndex === 1) {
      loadTrending();
    }
  }, [tabIndex]);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchPosts = React.useCallback((currentPage: number = page) => {
    setIsLoading(true);
    setError(null);
    setPage(currentPage);
      searchPosts({
      title: search.trim() ? search : undefined,
      category: category !== 'all' ? category : undefined,
    })
      .then(data => {
        if (Array.isArray(data)) {
          const filteredPosts = data;
          
          setPosts(filteredPosts);
          setTotalPages(Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)));
        } else {
          setPosts([]);
          setTotalPages(1);
        }
      })
      .catch(e => {
        setPosts([]);
        setTotalPages(1);
        setError('Erro ao buscar publicações. Tente novamente mais tarde.');
        console.error('Erro ao buscar posts:', e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [search, category, page]);

  const debouncedSearch = React.useCallback(() => {
    const delayedSearch = debounce(() => {
      fetchPosts(1); 
    }, 500);
    delayedSearch();
  }, [fetchPosts]);

  React.useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (post: BlogType) => {
    setModal({ open: true, type: 'edit', post });
  };

  const handleDeleteClick = (post: BlogType) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    window.scrollTo(0, 0);
    fetchPosts(value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
    fetchPosts(1);
  };

  const handleModalClose = () => {
    setModal({ open: false, type: null, post: null });
  };
  const handleDeleteConfirm = async () => {
    if (!postToDelete || !user) return;
    
    try {
      await deletePost(Number(postToDelete.id), user);
      fetchPosts(page);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir post:', error);
      setError(error.message || 'Falha ao excluir publicação. Tente novamente.');
    }
  };

  const handleSavePost = async (post: BlogType) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login para salvar a publicação.');
      }

      if (modal.type === 'create') {
        await createPost({
          title: post.title,
          content: post.content,
          userId: Number(user.id),
          category: post.category || 'Geral',
          movieId: post.movieId,
          serieId: post.serieId,
        });
      } else if (modal.type === 'edit' && post.id) {
        await updatePost(Number(post.id), {
          title: post.title,
          content: post.content,
          category: post.category,
          movieId: post.movieId,
          serieId: post.serieId,
        }, user);
      }

      fetchPosts(); 
      handleModalClose();
    } catch (error: any) {
      console.error('Erro ao salvar post:', error);
      setError(error.message || 'Falha ao salvar publicação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateFromTMDB = async (item: Movie | TVShow, type: 'movie' | 'tv') => {
    if (!checkUserAuth()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      let postTemplate;
      
      if (type === 'movie') {
        postTemplate = await createNewsFromMovie(item as Movie);
      } else {
        postTemplate = await createNewsFromTVShow(item as TVShow);
      }
      
      setModal({
        open: true,
        type: 'create',
        post: postTemplate as BlogType
      });
    } catch (error) {
      console.error('Erro ao criar template de post:', error);
      setError('Falha ao preparar novo post. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };const handleCreateReview = async (item: any, type: 'movie' | 'tv') => {
    if (!checkUserAuth()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const reviewTemplate = await createReviewTemplate(type, item.id);
      
      setModal({
        open: true,
        type: 'create',
        post: reviewTemplate as BlogType
      });
    } catch (error) {
      console.error('Erro ao criar template de review:', error);
      setError('Falha ao preparar nova review. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
 

  const currentPagePosts = posts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function TMDBMediaCard({ item, type }: { item: Movie | TVShow, type: 'movie' | 'tv' }) {
    const [isInWatchlist, setIsInWatchlist] = React.useState(false);

    React.useEffect(() => {
      setIsInWatchlist(watchlistService.isInWatchlist(item.id, type));
      
      const handleWatchlistUpdate = () => {
        setIsInWatchlist(watchlistService.isInWatchlist(item.id, type));
      };
      
      window.addEventListener('watchlistUpdated', handleWatchlistUpdate);
      return () => window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
    }, [item.id, type]);

    const toggleWatchlist = () => {
      if (isInWatchlist) {
        watchlistService.removeFromWatchlist(item.id, type);
      } else {
        watchlistService.addToWatchlist(item, type);
      }
    };

    return (
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
      }}>
        <Box sx={{ position: 'relative', pt: '150%' }}>
          <CardMedia
            component="img"
            image={item.poster_path 
              ? tmdbService.getImageUrl(item.poster_path) 
              : 'https://via.placeholder.com/300x450?text=Sem+Imagem'}
            alt={type === 'movie' ? (item as Movie).title : (item as TVShow).name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Chip
            icon={type === 'movie' ? <MovieFilterIcon /> : <TvIcon />}
            label={type === 'movie' ? 'Filme' : 'Série'}
            size="small"
            color={type === 'movie' ? 'primary' : 'secondary'}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 'bold'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              borderRadius: 1,
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <StarIcon fontSize="small" sx={{ color: 'gold' }} />
            <Typography variant="body2" color="white" fontWeight="bold">
              {item.vote_average.toFixed(1)}/10
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" noWrap>
            {type === 'movie' ? (item as Movie).title : (item as TVShow).name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {item.overview || 'Sem descrição disponível.'}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>          <Button 
            variant="contained" 
            size="small" 
            onClick={() => handleCreatePost(item, type)}
            startIcon={<AddIcon />}
          >
            Criar Post
          </Button>
          <IconButton 
            onClick={toggleWatchlist} 
            color="primary"
            aria-label={isInWatchlist ? 'Remover da Watchlist' : 'Adicionar à Watchlist'}
          >
            {isInWatchlist ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </CardActions>
      </Card>
    );
  }
  const handleCreatePost = (item?: any, type?: 'movie' | 'tv') => {
    if (!checkUserAuth()) {
      return;
    }
    
    if (item && type) {
      handleCreateFromTMDB(item, type);
    } else {
      setModal({
        open: true,
        type: 'create',
        post: {
          title: '',
          content: '',
          category: 'Filmes',
        } as BlogType
      });
    }
  };

  const checkUserAuth = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }
    return true;
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange}
          aria-label="blog tabs"
          variant="fullWidth"
        >
          <Tab 
            icon={<RssFeedRoundedIcon />} 
            iconPosition="start" 
            label="Publicações" 
            {...a11yProps(0)}
          />
          <Tab 
            icon={<TrendingUpIcon />} 
            iconPosition="start" 
            label="Tendências TMDB" 
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabIndex} index={0}>
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <OutlinedInput
                  placeholder="Pesquisar posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchRoundedIcon color="action" />
                    </InputAdornment>
                  }
                  sx={(theme) => ({
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                    },
                  })}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" variant="outlined">
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Categoria' }}
                  sx={(theme) => ({
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                    },
                  })}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ borderRadius: '16px', overflow: 'hidden', height: '100%', boxShadow: 2 }}>
                  <Skeleton variant="rectangular" height={200} animation="wave" />
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" height={30} animation="wave" />
                    <Skeleton variant="text" animation="wave" />
                    <Skeleton variant="text" animation="wave" />
                    <Skeleton variant="text" width="60%" animation="wave" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {error}
          </Alert>        ) : posts.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 2,
            borderRadius: '16px',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={500}>
              Nenhuma publicação encontrada
            </Typography>
            <Typography color="text.secondary">
              Tente mudar os filtros ou acesse a aba "Tendências TMDB" para criar posts a partir de filmes e séries.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>              {currentPagePosts.map((post, index) => {
                const canEdit = user && canEditPost(user, post);
                const canDelete = user && canDeletePost(user, post);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <BlogCardItem
                      post={post}
                      onEditClick={canEdit ? handleEditClick : undefined}
                      onDeleteClick={canDelete ? handleDeleteClick : undefined}
                      isFocused={focusedCardIndex === index}
                    />
                  </Grid>
                );
              })}
            </Grid>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </TabPanel>

      {/* Aba de Tendências TMDB */}
      <TabPanel value={tabIndex} index={1}>
        {loadingTrending ? (
          <Grid container spacing={3}>
            {Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={300} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            {/* Filmes em tendência */}
            <Box mb={6}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                mb: 3
              }}>
                <MovieFilterIcon color="primary" /> Filmes em Tendência
              </Typography>
              
              <Grid container spacing={3}>
                {trendingMovies.slice(0, 6).map((movie) => (
                  <Grid item xs={12} sm={6} md={4} key={movie.id}>
                    <TMDBMediaCard item={movie} type="movie" />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Séries em tendência */}
            <Box mb={6}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                mb: 3
              }}>
                <TvIcon color="secondary" /> Séries em Tendência
              </Typography>
              
              <Grid container spacing={3}>
                {trendingTVShows.slice(0, 6).map((show) => (
                  <Grid item xs={12} sm={6} md={4} key={show.id}>
                    <TMDBMediaCard item={show} type="tv" />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Sugestões da watchlist */}
            {watchlistSuggestions && watchlistSuggestions.reviewSuggestions.length > 0 && (
              <Box mb={6}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}>
                  <BookmarkIcon color="warning" /> Sugestões da sua Watchlist
                </Typography>
                
                <Grid container spacing={3}>
                  {watchlistSuggestions.reviewSuggestions.map((suggestion, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ position: 'relative', pt: '56.25%' }}>
                          <CardMedia
                            component="img"
                            image={suggestion.item.poster_path 
                              ? tmdbService.getImageUrl(suggestion.item.poster_path) 
                              : 'https://via.placeholder.com/300x450?text=Sem+Imagem'}
                            alt={suggestion.item.title}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {suggestion.item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Criar uma review ou notícia sobre este item da sua watchlist
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ p: 2 }}>
                          <Button 
                            variant="outlined" 
                            fullWidth
                            onClick={() => handleCreateReview(suggestion.item, suggestion.type)}
                            startIcon={<NewReleasesIcon />}
                          >
                            Escrever Review
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </TabPanel>      <StandardModal
        open={modal.open}
        title={modal.type === 'create' ? 'Nova Publicação baseada em TMDB' : 'Editar Publicação'}
        onClose={handleModalClose}
      >
        <PostForm
          modal={modal}
          setModal={setModal}
          onSave={handleSavePost}
        />
      </StandardModal>

      {/* Modal de confirmação para excluir post */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        title="Excluir publicação"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}