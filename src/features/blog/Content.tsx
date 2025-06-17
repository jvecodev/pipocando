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
import BlogDetail from './BlogDetail';

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
  // Busca todos os posts do backend (sem paginação)
  const fetchPosts = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setPosts([]);
      setTotalPages(1);
      setIsLoading(false);
      return;
    }
    
    searchPosts({
      title: search.trim() ? search : undefined,
      category: category !== 'all' ? category : undefined,
    })
      .then(data => {
        const allPosts = Array.isArray(data) ? data : [];
        // Garante que userId seja preenchido a partir de author.id se necessário
        const postsWithUserId = allPosts.map((post: any) => ({
          ...post,
          userId: post.userId !== undefined && post.userId !== null ? post.userId : post.author?.id || null
        }));
        setPosts(postsWithUserId);
        setTotalPages(Math.max(1, Math.ceil(postsWithUserId.length / ITEMS_PER_PAGE)));
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
  }, [search, category]);

  // Resetar página ao trocar busca/filtro e buscar posts
  React.useEffect(() => {
    setPage(1);
    fetchPosts();
  }, [search, category, fetchPosts]);

  const handleEditClick = (post: BlogType) => {
    setModal({ open: true, type: 'edit', post });
  };

  const handleDeleteClick = (post: BlogType) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
    setPage(1); 
  };

  const handleModalClose = () => {
    setModal({ open: false, type: null, post: null });
  };  const handleDeleteConfirm = async () => {
    if (!postToDelete || !user) return;
    
    try {
      await deletePost(Number(postToDelete.id), user);
      setPage(1);
      fetchPosts();
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
      
      let imageUrl = post.urlImage || post.imageUrl;
      
      if (imageUrl && imageUrl.length > 1000) {
        imageUrl = imageUrl.substring(0, 1000);
      }
      
      const category = post.category || 'blog';
      if (!['Filmes', 'Séries'].includes(category)) {
        throw new Error('Categoria inválida. Selecione Filmes ou Séries.');
      }
     
      if (modal.type === 'create') {
        if (category === 'Filmes' && !post.movieId) {
          if (post.tmdbId && post.tmdbType === 'movie') {
            post.movieId = post.tmdbId;
          } else {
            throw new Error('Para a categoria Filmes, é necessário informar o ID do filme.');
          }
        } else if (category === 'Séries' && !post.serieId) {
          if (post.tmdbId && post.tmdbType === 'tv') {
            post.serieId = post.tmdbId;
          } else {
            throw new Error('Para a categoria Séries, é necessário informar o ID da série.');
          }
        }      } else {
      }          // Monta o payload conforme a categoria
      // Garantir que sempre tenhamos um userId válido
      let originalUserId;
      if (modal.type === 'edit') {
        // Se post.userId existir e for válido, usa ele; senão, mantém o usuário atual
        originalUserId = post.userId && post.userId !== null ? Number(post.userId) : Number(user.id);
      } else {
        originalUserId = Number(user.id);
      }
      
      const payload: any = {
        title: post.title,
        content: post.content,
        userId: originalUserId, // Sempre enviar userId válido para o backend
        urlImage: imageUrl,
        category: category,
      };
      
      // Log para confirmar o userId que está sendo enviado
      if (modal.type === 'edit') {
        console.log(`Editando post: enviando userId=${originalUserId} para o backend`);
      } else {
        console.log(`Criando post: enviando userId=${originalUserId} (usuário logado) para o backend`);
      }
      
      if (category === 'Filmes') {
        payload.movieId = post.movieId || (post.tmdbId && post.tmdbType === 'movie' ? post.tmdbId : undefined);
        
        payload.serieId = undefined;
        
      } else if (category === 'Séries') {
        payload.serieId = post.serieId || (post.tmdbId && post.tmdbType === 'tv' ? post.tmdbId : undefined);
        
        payload.movieId = undefined;
        
      }      
      if (modal.type === 'edit' && post.id) {
        if (category === 'Filmes' && !payload.movieId) {
          payload.movieId = Number(post.id);
        } else if (category === 'Séries' && !payload.serieId) {
          payload.serieId = Number(post.id);
        }
      }      
      
      if (modal.type === 'edit') {
        console.log(`Editando post: mantendo userId original (${payload.userId}) ao invés do userId do editor (${user.id})`);
      } else {
        console.log(`Criando post: usando userId do criador (${payload.userId})`);
      }

      if (modal.type === 'create') {
        await createPost(payload);
      } else if (modal.type === 'edit' && post.id) {
        await updatePost(Number(post.id), payload, user);
      }      fetchPosts(); 
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

  // Adiciona navegação ao clicar no card do blog
  const handleCardClick = (post: BlogType) => {
    navigate(`/blog/${post.id}`);
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
          </Alert>
        ) : !localStorage.getItem('token') ? (
          <Box 
            sx={(theme) => ({ 
              textAlign: 'center', 
              py: 8, 
              px: 4,
              borderRadius: '16px',
              backgroundImage: theme.palette.mode === 'dark' 
                ? 'radial-gradient(ellipse at top, rgba(25, 118, 210, 0.2), transparent), radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.1), transparent)'
                : 'radial-gradient(ellipse at top, rgba(25, 118, 210, 0.1), transparent), radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.05), transparent)',
              border: `2px solid ${theme.palette.primary.main}40`,
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
              animation: 'pulseFade 3s infinite alternate',
              '@keyframes pulseFade': {
                '0%': { boxShadow: '0 0 20px -10px rgba(25, 118, 210, 0.3)' },
                '100%': { boxShadow: '0 0 30px -5px rgba(25, 118, 210, 0.6)' }
              }
            })}
          >
            <Typography 
              variant="h4" 
              color="primary" 
              gutterBottom 
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Acesse sua conta para ver as publicações!
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph 
              sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}
            >
              Faça login ou cadastre-se agora para explorar todas as publicações, criar seus próprios posts e interagir com a comunidade Pipocando.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained" 
                color="primary"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px'
                }}
              >
                Fazer Login
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px'
                }}
              >
                Cadastrar-se
              </Button>
            </Box>
          </Box>
        ) : posts.length === 0 ? (
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
                const userIdNum = user ? Number(user.id) : null;
                const postUserIdNum = post.userId !== undefined && post.userId !== null ? Number(post.userId) : null;
                const canEditOrDelete = user && (user.perfil === 'ADMIN' || userIdNum === postUserIdNum);
                return (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <BlogCardItem
                      post={post}
                      onEditClick={canEditOrDelete ? handleEditClick : undefined}
                      onDeleteClick={canEditOrDelete ? handleDeleteClick : undefined}
                      onCardClick={handleCardClick}
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
        ) : !localStorage.getItem('token') ? (
          <Box 
            sx={(theme) => ({ 
              textAlign: 'center', 
              py: 8, 
              px: 4,
              borderRadius: '16px',
              backgroundImage: theme.palette.mode === 'dark' 
                ? 'radial-gradient(ellipse at top, rgba(156, 39, 176, 0.2), transparent), radial-gradient(ellipse at bottom, rgba(33, 150, 243, 0.1), transparent)'
                : 'radial-gradient(ellipse at top, rgba(156, 39, 176, 0.1), transparent), radial-gradient(ellipse at bottom, rgba(33, 150, 243, 0.05), transparent)',
              border: `2px solid ${theme.palette.secondary.main}40`,
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
              animation: 'pulseGlow 3s infinite alternate',
              '@keyframes pulseGlow': {
                '0%': { boxShadow: '0 0 20px -10px rgba(156, 39, 176, 0.3)' },
                '100%': { boxShadow: '0 0 30px -5px rgba(156, 39, 176, 0.6)' }
              }
            })}
          >
            <Typography 
              variant="h4" 
              color="secondary" 
              gutterBottom 
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Descubra as tendências do momento!
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph 
              sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}
            >
              Faça login ou cadastre-se agora para explorar filmes e séries em destaque, criar publicações sobre eles e compartilhar suas opiniões.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained" 
                color="secondary"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px'
                }}
              >
                Fazer Login
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px'
                }}
              >
                Cadastrar-se
              </Button>
            </Box>
          </Box>
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
            )}          </>
        )}
      </TabPanel>
      
      <StandardModal
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