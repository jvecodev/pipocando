import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import TextareaAutosize from 'react-textarea-autosize';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import TvIcon from '@mui/icons-material/Tv';
import StarIcon from '@mui/icons-material/Star';
import { BlogType } from '../../types/BlogRequestResponse';
import tmdbService, { Movie as TMDBMovie, TVShow } from '../../services/tmdbService';
import { createNewsFromMovie, createNewsFromTVShow, createReviewTemplate } from '../../services/blogTmdbService';

const validateField = (field: string | undefined, fieldName: string): string => {
  if (!field || field.trim() === '') {
    return `O campo ${fieldName} é obrigatório`;
  }
  return '';
};

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

// Constante para o número máximo de caracteres permitidos
const MAX_CONTENT_LENGTH = 2000;

export default function PostForm({ modal, setModal, onSave }: PostFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tmdbSearchQuery] = useState<string>('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState<Array<TMDBMovie | TVShow>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTab, setSearchTab] = useState<number>(0);
  const [selectedTemplate] = useState<string>('none');
  const [contentLength, setContentLength] = useState<number>(0);
  const [exceedsMaxLength, setExceedsMaxLength] = useState<boolean>(false);
  // Estado para rastrear a mudança de cor do contador
  const [countColor, setCountColor] = useState<'normal' | 'warning' | 'error'>('normal');

  useEffect(() => {
    if (!tmdbSearchQuery.trim()) {
      setTmdbSearchResults([]);
    }
  }, [tmdbSearchQuery]);  // Função para verificar e atualizar o comprimento do conteúdo  // Referência para armazenar o temporizador de debounce
  const debounceRef = React.useRef<any>(null);

  // Função simplificada que apenas atualiza o contador (operação leve)
  const updateCounter = (text: string) => {
    const length = text?.length || 0;
    setContentLength(length);
  };
  
  // Função para verificar limites e atualizar estados (potencialmente pesada)
  // Separada para uso com debounce
  const validateContentLength = React.useCallback((text: string) => {
    const length = text?.length || 0;
    
    // Atualizar cor do contador baseado na porcentagem de uso
    const percentage = (length / MAX_CONTENT_LENGTH) * 100;
    if (percentage > 100) {
      setCountColor('error');
    } else if (percentage > 90) {
      setCountColor('warning');
    } else {
      setCountColor('normal');
    }
    
    const isExceeding = length > MAX_CONTENT_LENGTH;
    
    // Atualizar estado de erro apenas se necessário
    if (isExceeding) {
      setExceedsMaxLength(true);
      setErrors(prev => {
        // Se já temos o erro, não atualize o estado
        if (prev.content && prev.content.includes('limite máximo')) {
          return prev;
        }
        return {
          ...prev,
          content: `O conteúdo excede o limite máximo de ${MAX_CONTENT_LENGTH} caracteres.`
        };
      });
    } else {
      setExceedsMaxLength(false);
      setErrors(prev => {
        // Se não temos erro de limite, não atualize o estado
        if (!prev.content || !prev.content.includes('limite máximo')) {
          return prev;
        }
        const newErrors = { ...prev };
        newErrors.content = '';
        return newErrors;
      });
    }
    
    return isExceeding;
  }, []);
  
  // Função que combina as duas operações com debounce para as validações pesadas
  const checkContentLength = React.useCallback((text: string) => {
    // Sempre atualize o contador imediatamente (operação leve)
    updateCounter(text);
    
    // Limpar o temporizador anterior para evitar múltiplas validações
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Executar validações com debounce para evitar loops de atualização
    debounceRef.current = setTimeout(() => {
      validateContentLength(text);
    }, 300);
    
    return text.length > MAX_CONTENT_LENGTH;
  }, [validateContentLength]);
  
  // Inicializar o contador de caracteres e verificar se excede o limite  
  useEffect(() => {
    const content = modal.post?.content || '';
    // Usar nossa função de verificação que já cuida de tudo
    checkContentLength(content);
  }, [modal.post?.content, checkContentLength]);

  const handleTMDBSearch = async () => {
    if (!tmdbSearchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      if (searchTab === 0) {
        const response = await tmdbService.searchMovies(tmdbSearchQuery);
        setTmdbSearchResults(response.results);
      } else {
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

  const handleSelectTMDBItem = async (item: TMDBMovie | TVShow, type: 'movie' | 'tv') => {
    try {
      let templateData: Partial<BlogType> | null = null;
      
      if (selectedTemplate === 'news') {
        if (type === 'movie') {
          templateData = await createNewsFromMovie(item as TMDBMovie);
        } else {
          templateData = await createNewsFromTVShow(item as TVShow);
        }
      } else if (selectedTemplate === 'review') {
        templateData = await createReviewTemplate(type, item.id);
      } else {
        templateData = {
          title: type === 'movie' ? (item as TMDBMovie).title : (item as TVShow).name,
          category: type === 'movie' ? 'Filmes' : 'Séries',
          tmdbId: item.id,
          tmdbType: type,
          tmdbData: item,
          imageUrl: item.poster_path ? tmdbService.getImageUrl(item.poster_path) : undefined
        };
      }
      
      setModal({
        ...modal,
        post: {
          ...modal.post,
          ...templateData
        } as BlogType
      });
      
      setTmdbSearchResults([]);
    } catch (error) {
      console.error('Erro ao criar template:', error);
      setSearchError('Falha ao criar template. Tente novamente.');
    }
  };  // Função simplificada para não usar debounce em outros campos
  const updatePost = (field: string, value: any) => {
    // O campo de conteúdo agora é tratado separadamente
    // para evitar lentidão na digitação
    if (field === 'content') {
      console.warn('Use a função dedicada para o campo de conteúdo');
      return;
    }
    
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
  };  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar qualquer debounce pendente
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    const currentPost = modal.post || {} as BlogType;
    const validationErrors: Record<string, string> = {};
    
    validationErrors.title = validateField(currentPost.title, 'Título');
    validationErrors.content = validateField(currentPost.content, 'Conteúdo');
    validationErrors.category = validateField(currentPost.category, 'Categoria');
    
    // Verificar imediatamente se o conteúdo excede o limite máximo de caracteres
    const contentLength = currentPost.content?.length || 0;
    if (contentLength > MAX_CONTENT_LENGTH) {
      validationErrors.content = `O conteúdo excede o limite máximo de ${MAX_CONTENT_LENGTH} caracteres.`;
    }
    
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    
    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }
    
    onSave(currentPost);
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
  };  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={(theme) => ({
        '& .MuiFormControl-root': { mb: 3 },
        '& .MuiTextField-root': { mb: 3 },
        position: 'relative',
        padding: { xs: 2, sm: 3 },
        borderRadius: '16px',
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage:
          theme.palette.mode === 'dark'
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(210, 100%, 18%, 0.5), transparent)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(211, 100%, 83.1%, 0.2), transparent)",
      })}
    >
      <Grid container spacing={3}>
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
              sx: { 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                },
                '&:focus-within': {
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                }
              },
            }}
            InputLabelProps={{
              sx: {
                [`&.MuiInputLabel-shrink`]: {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  background: (theme) => 
                    `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 50%, transparent 50%, transparent 100%)`,
                  padding: '0 4px',
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={2}
            value={modal.post?.description || ''}
            onChange={(e) => updatePost('description', e.target.value)}
            InputProps={{ 
              sx: { 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                },
                '&:focus-within': {
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                }
              },
            }}
            InputLabelProps={{
              sx: {
                [`&.MuiInputLabel-shrink`]: {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  background: (theme) => 
                    `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 50%, transparent 50%, transparent 100%)`,
                  padding: '0 4px',
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>          
          <FormControl fullWidth error={!!errors.category} required>
            <InputLabel 
              sx={{
                [`&.MuiInputLabel-shrink`]: {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  background: (theme) => 
                    `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 50%, transparent 50%, transparent 100%)`,
                  padding: '0 4px',
                }
              }}
            >Categoria</InputLabel>
            <Select
              value={modal.post?.category || ''}
              onChange={(e) => updatePost('category', e.target.value)}
              label="Categoria"
              sx={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              <MenuItem value="Filmes">Filmes</MenuItem>
              <MenuItem value="Séries">Séries</MenuItem>
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>          
          <TextField
            fullWidth
            label="URL da Imagem"
            value={modal.post?.imageUrl || ''}
            onChange={(e) => updatePost('imageUrl', e.target.value)}
            InputProps={{ 
              sx: { 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                },
                '&:focus-within': {
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                }
              },
            }}
            InputLabelProps={{
              sx: {
                [`&.MuiInputLabel-shrink`]: {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  background: (theme) => 
                    `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 50%, transparent 50%, transparent 100%)`,
                  padding: '0 4px',
                }
              }
            }}
          />
        </Grid>        <Grid item xs={12}>            <Box sx={{ position: 'relative' }}>
            <Box
              sx={(theme) => ({
                border: `1px solid ${errors.content ? theme.palette.error.main : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)')}`,
                borderRadius: '12px',
                padding: '16.5px 14px',
                paddingTop: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                marginBottom: 1,
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                },
                '&:focus-within': {
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                  borderColor: errors.content ? theme.palette.error.main : theme.palette.primary.main,
                  borderWidth: 2,
                  padding: '15.5px 13px',
                  paddingTop: '23px',
                }
              })}
            >
              <Typography
                variant="caption"
                component="label"
                htmlFor="content-textarea"
                sx={(theme) => ({
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: 'translate(14px, -9px) scale(0.75)',
                  background: theme.palette.background.default,
                  padding: '0 4px',
                  color: errors.content 
                    ? theme.palette.error.main 
                    : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'),
                  fontWeight: 400,
                })}
              >
                Conteúdo {errors.content ? '*' : ''}
              </Typography>                <TextareaAutosize
                id="content-textarea"
                value={modal.post?.content || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Atualizar apenas o valor no state e o contador
                  setModal(prev => ({
                    ...prev,
                    post: {
                      ...prev.post,
                      content: value
                    } as BlogType
                  }));
                  
                  // Usar a função otimizada com debounce para evitar loops
                  checkContentLength(value);
                }}
                onBlur={(e) => {
                  // Ao perder o foco, verificar imediatamente sem debounce
                  if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                  }
                  validateContentLength(e.target.value);
                }}
                minRows={15}
                maxRows={30}
                cacheMeasurements
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  background: 'transparent',
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  color: 'inherit',
                }}
              />
            </Box>
            
            {errors.content && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: theme => theme.palette.error.main,
                  marginTop: '3px',
                  marginLeft: '14px'
                }}
              >
                {errors.content}
              </Typography>
            )}            <Box sx={{
              position: 'absolute',
              bottom: errors.content ? '24px' : '0',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 4px',
              borderRadius: '4px',
              backgroundColor: (theme) => 
                countColor === 'error'
                  ? theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.08)'
                  : countColor === 'warning'
                    ? theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.15)' : 'rgba(237, 108, 2, 0.08)'
                    : 'transparent',
              transition: 'all 0.3s ease',
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: (theme) => 
                    countColor === 'error' 
                      ? theme.palette.error.main
                      : countColor === 'warning'
                        ? theme.palette.warning.main
                        : theme.palette.text.secondary,
                  transition: 'color 0.3s ease',
                  fontWeight: countColor !== 'normal' ? 600 : 400
                }}
              >
                {contentLength}/{MAX_CONTENT_LENGTH} caracteres
              </Typography>
            </Box>
          </Box>
        </Grid>        {modal.post?.tmdbData && (
          <Grid item xs={12}>              
          <Box sx={(theme) => ({ 
              p: 3, 
              border: '1px solid', 
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              backgroundImage:
                theme.palette.mode === 'dark'
                  ? "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(210, 100%, 18%, 0.5), transparent)"
                  : "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(211, 100%, 83.1%, 0.2), transparent)",
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
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

        <Grid item xs={12}>          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              onClick={() => setModal({ open: false, type: null })}
              variant="outlined"
              sx={(theme) => ({ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(0, 0, 0, 0.3)',
                }
              })}
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
                px: 4,
                py: 1.2,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)'
                }
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
