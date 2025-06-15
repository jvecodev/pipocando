import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import TvIcon from '@mui/icons-material/Tv';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import { BlogType, PostTypeEnum, POST_TYPE_LABELS } from '../../types/BlogRequestResponse';
import tmdbService, { Movie as TMDBMovie, TVShow } from '../../services/tmdbService';
import { createNewsFromMovie, createNewsFromTVShow, createReviewTemplate } from '../../services/blogTmdbService';

// Validação de campos
const validateField = (field: string | undefined, fieldName: string): string => {
  if (!field || field.trim() === '') {
    return `O campo ${fieldName} é obrigatório`;
  }
  return '';
};

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
      id={`tmdb-search-tabpanel-${index}`}
      aria-labelledby={`tmdb-search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tmdb-search-tab-${index}`,
    'aria-controls': `tmdb-search-tabpanel-${index}`,
  };
}

interface PostFormProps {
  modal: {
    open: boolean;
    type: 'create' | 'edit' | 'delete' | null;
    post?: BlogType | null;
  };
  setModal: React.Dispatch<React.SetStateAction<{
    open: boolean;
    type: 'create' | 'edit' | 'delete' | null;
    post?: BlogType | null;
  }>>;
  onSave: (post: BlogType) => void;
}

export default function PostForm({ modal, setModal, onSave }: PostFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState<string>('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState<Array<TMDBMovie | TVShow>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTab, setSearchTab] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  
  // Efeito para limpar os resultados da pesquisa quando a query muda
  useEffect(() => {
    if (!tmdbSearchQuery.trim()) {
      setTmdbSearchResults([]);
    }
  }, [tmdbSearchQuery]);

  // Handler de busca TMDB
  const handleTMDBSearch = async () => {
    if (!tmdbSearchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Buscar filmes ou séries com base na aba atual
      if (searchTab === 0) {
        // Buscar filmes
        const response = await tmdbService.searchMovies(tmdbSearchQuery);
        setTmdbSearchResults(response.results);
      } else {
        // Buscar séries
        const response = await tmdbService.searchTVShows(tmdbSearchQuery);
        setTmdbSearchResults(response.results);
      }
    } catch (error) {
      console.error('Erro ao buscar no TMDB:', error);
      setSearchError('Falha ao buscar. Tente novamente.');
      setTmdbSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Selecionar item do TMDB e criar template
  const handleSelectTMDBItem = async (item: TMDBMovie | TVShow, type: 'movie' | 'tv') => {
    try {
      let templateData: Partial<BlogType> | null = null;
      
      // Baseado no template selecionado
      if (selectedTemplate === 'news') {
        if (type === 'movie') {
          templateData = await createNewsFromMovie(item as TMDBMovie);
        } else {
          templateData = await createNewsFromTVShow(item as TVShow);
        }
      } else if (selectedTemplate === 'review') {
        templateData = await createReviewTemplate(type, item.id);
      } else {
        // Template padrão - apenas definir os dados do TMDB
        templateData = {
          title: type === 'movie' ? (item as TMDBMovie).title : (item as TVShow).name,
          category: type === 'movie' ? 'Filmes' : 'Séries',
          tmdbId: item.id,
          tmdbType: type,
          tmdbData: item,
          imageUrl: item.poster_path ? tmdbService.getImageUrl(item.poster_path) : undefined
        };
      }
      
      // Atualizar o post no modal
      setModal({
        ...modal,
        post: {
          ...modal.post,
          ...templateData
        } as BlogType
      });
      
      // Limpar a pesquisa
      setTmdbSearchResults([]);
    } catch (error) {
      console.error('Erro ao criar template:', error);
      setSearchError('Falha ao criar template. Tente novamente.');
    }
  };
  // Função para atualizar campos do post
  const updatePost = (field: string, value: any) => {
    setModal((m) => {
      if (!m.post) return m;
      
      return {
        ...m,
        post: {
          ...m.post,
          [field]: value
        } as BlogType
      };
    });
  };

  // Validação e submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentPost = modal.post || {} as BlogType;
    const validationErrors: Record<string, string> = {};
    
    // Validação básica
    validationErrors.title = validateField(currentPost.title, 'Título');
    validationErrors.content = validateField(currentPost.content, 'Conteúdo');
    
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    
    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }
    
    // Submeter formulário
    onSave(currentPost);
  };

  // Handler para mudança de aba na busca TMDB
  const handleChangeSearchTab = (_: React.SyntheticEvent, newValue: number) => {
    setSearchTab(newValue);
    setTmdbSearchResults([]); // Limpa resultados ao trocar aba
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTMDBSearch();
    }
  };

  // Componente para exibir resultados da busca TMDB
  const TMDBSearchResult = ({ 
    item, 
    type 
  }: { 
    item: TMDBMovie | TVShow; 
    type: 'movie' | 'tv' 
  }) => {
    const title = type === 'movie' 
      ? (item as TMDBMovie).title 
      : (item as TVShow).name;
    
    const year = type === 'movie'
      ? (item as TMDBMovie).release_date?.substring(0, 4)
      : (item as TVShow).first_air_date?.substring(0, 4);

    return (
      <Card sx={{ 
        display: 'flex', 
        mb: 2,
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
      }}>
        <CardMedia
          component="img"
          sx={{ width: 80, height: 120, objectFit: 'cover' }}
          image={item.poster_path 
            ? tmdbService.getImageUrl(item.poster_path) 
            : 'https://via.placeholder.com/80x120?text=Sem+Imagem'}
          alt={title}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
            <Typography component="h5" variant="h6">
              {title} {year ? `(${year})` : ''}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ color: 'gold', mr: 0.5 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {item.vote_average.toFixed(1)}/10
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {item.overview || 'Sem descrição disponível.'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handleSelectTMDBItem(item, type)}
              startIcon={<AddCircleIcon />}
            >
              Usar este {type === 'movie' ? 'filme' : 'série'}
            </Button>
          </CardActions>
        </Box>
      </Card>
    );
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{
        '& .MuiFormControl-root': { mb: 3 },
        '& .MuiTextField-root': { mb: 3 },
      }}
    >
      <Grid container spacing={3}>
        {/* Título */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Título"
            value={modal.post?.title || ''}
            onChange={(e) => updatePost('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
            InputProps={{ 
              sx: { borderRadius: '12px' },
            }}
          />
        </Grid>

        {/* Descrição */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={2}
            value={modal.post?.description || ''}
            onChange={(e) => updatePost('description', e.target.value)}
            InputProps={{ 
              sx: { borderRadius: '12px' },
            }}
          />
        </Grid>

        {/* Categoria e Tipo de Post */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={modal.post?.category || ''}
              onChange={(e) => updatePost('category', e.target.value)}
              label="Categoria"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="Filmes">Filmes</MenuItem>
              <MenuItem value="Séries">Séries</MenuItem>
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Post</InputLabel>
            <Select
              value={modal.post?.postType || ''}
              onChange={(e) => updatePost('postType', e.target.value)}
              label="Tipo de Post"
              sx={{ borderRadius: '12px' }}
            >
              {Object.entries(PostTypeEnum).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {POST_TYPE_LABELS[value as PostTypeEnum]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* URL da Imagem */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="URL da Imagem"
            value={modal.post?.imageUrl || ''}
            onChange={(e) => updatePost('imageUrl', e.target.value)}
            InputProps={{ 
              sx: { borderRadius: '12px' },
            }}
          />
        </Grid>

        {/* Conteúdo */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Conteúdo"
            multiline
            rows={6}
            value={modal.post?.content || ''}
            onChange={(e) => updatePost('content', e.target.value)}
            error={!!errors.content}
            helperText={errors.content}
            required
            InputProps={{ 
              sx: { borderRadius: '12px' },
            }}
          />
        </Grid>

        {/* Destacado */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={modal.post?.featured || false}
                onChange={(e) => updatePost('featured', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body1" fontWeight={500}>
                Destacar publicação
              </Typography>
            }
          />
        </Grid>

        {modal.post?.postType === PostTypeEnum.REVIEW && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ width: '100%' }}>
              <Typography component="legend" fontWeight={500} gutterBottom>
                Avaliação
              </Typography>
              <Rating
                name="rating"
                value={(modal.post.rating || 0) / 2}
                precision={0.5}
                onChange={(_, value) => updatePost('rating', value ? value * 2 : 0)}
                size="large"
                sx={{ 
                  '& .MuiRating-iconFilled': {
                    color: 'warning.main',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {modal.post.rating ? `${modal.post.rating}/10` : 'Sem avaliação'}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* TMDB Info */}
        {modal.post?.tmdbData && (
          <Grid item xs={12}>            <Box sx={(theme) => ({ 
              p: 3, 
              border: '1px solid', 
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            })}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Informações do TMDB
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Box
                    component="img"
                    sx={{
                      width: 100,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: 2,
                    }}
                    src={
                      modal.post.tmdbData.poster_path
                        ? tmdbService.getImageUrl(modal.post.tmdbData.poster_path)
                        : 'https://via.placeholder.com/100x150?text=Sem+Imagem'
                    }
                    alt={modal.post.title}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {modal.post.tmdbType === 'movie' 
                      ? modal.post.tmdbData.title 
                      : modal.post.tmdbData.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StarIcon sx={{ color: 'warning.main', mr: 0.5 }} fontSize="small" />
                    <Typography variant="body1" fontWeight={500}>
                      {modal.post.tmdbData.vote_average.toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Chip 
                    icon={modal.post.tmdbType === 'movie' ? <MovieFilterIcon /> : <TvIcon />}
                    label={modal.post.tmdbType === 'movie' ? 'Filme' : 'Série'}
                    size="small"
                    color={modal.post.tmdbType === 'movie' ? 'primary' : 'secondary'}
                    sx={{ fontWeight: 500 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              onClick={() => setModal({ open: false, type: null })}
              variant="outlined"
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              {modal.type === 'create' ? 'Criar' : 'Atualizar'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
