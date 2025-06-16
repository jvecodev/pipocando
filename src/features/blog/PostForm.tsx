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
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { BlogType } from '../../types/BlogRequestResponse';
import tmdbService, { Movie as TMDBMovie, TVShow } from '../../services/tmdbService';
import { createNewsFromMovie, createNewsFromTVShow, createReviewTemplate } from '../../services/blogTmdbService';

// Função para validar URLs de imagens - versão mais permissiva
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    // Verifica se a URL é absoluta
    if (!urlObj.protocol.startsWith('http')) return false;
    
    // Extensões comuns de imagens
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
    const path = urlObj.pathname.toLowerCase();
    
    // Verifica se a URL contém parâmetros comuns de imagem
    const hasImageParams = url.includes('?image=') || url.includes('&image=') || 
                           url.includes('?img=') || url.includes('&img=') ||
                           url.includes('?src=') || url.includes('&src=');
    
    // Se a URL termina com uma extensão de imagem conhecida, é provavelmente uma imagem direta
    return imageExtensions.some(ext => path.endsWith(ext)) || 
           path.includes('/image/') ||
           path.includes('/images/') ||
           path.includes('/img/') ||
           path.includes('/media/') ||
           hasImageParams ||
           // URLs de serviços de imagem conhecidos
           urlObj.hostname.includes('imgur.com') || 
           urlObj.hostname.includes('cloudinary.com') ||
           urlObj.hostname.includes('unsplash.com') ||
           urlObj.hostname.includes('image.tmdb.org') ||
           urlObj.hostname.includes('media.tenor.com') ||
           urlObj.hostname.includes('i.postimg.cc') ||
           urlObj.hostname.includes('ibb.co') ||
           urlObj.hostname.includes('postimg.cc') ||
           urlObj.hostname.includes('lh3.googleusercontent.com') ||
           urlObj.hostname.includes('storage.googleapis.com') ||
           (urlObj.hostname.includes('googleusercontent.com') && url.includes('image'));
  } catch (error) {
    // Se não for possível analisar a URL, retornar false, mas permitindo
    // que qualquer valor seja tentado na exibição
    console.warn('Erro ao analisar URL:', error);
    return url.startsWith('http') && (
      url.includes('.jpg') || url.includes('.jpeg') || 
      url.includes('.png') || url.includes('.gif') || 
      url.includes('.webp') || url.includes('.svg') ||
      url.includes('.avif')
    );
  }
};

// Função para extrair URLs de imagem diretas de URLs de busca
const extractDirectImageUrl = (url: string): string | null => {
  try {
    // Se já for uma URL de imagem válida, retornar como está
    if (isValidImageUrl(url)) return url;
    
    // Tentar extrair a URL da imagem de URLs do Google Imagens
    if (url.includes('imgurl=')) {
      const match = url.match(/imgurl=([^&]+)/);
      if (match && match[1]) {
        const decodedUrl = decodeURIComponent(match[1]);
        if (isValidImageUrl(decodedUrl)) {
          console.log('URL de imagem extraída do Google:', decodedUrl);
          return decodedUrl;
        }
      }
    }
    
    // Verificar se é um link do Imgur
    if (url.includes('imgur.com/') && !url.includes('/a/')) {
      // Converter links do Imgur para links diretos de imagem
      const imgurId = url.split('/').pop()?.split('.')[0];
      if (imgurId) {
        const directUrl = `https://i.imgur.com/${imgurId}.jpg`;
        console.log('URL de imagem extraída do Imgur:', directUrl);
        return directUrl;
      }
    }
    
    // Verificar se é um link do Postimg.cc
    if (url.includes('postimg.cc/') && !url.includes('/i.postimg.cc/')) {
      // Converter links do Postimg para links diretos de imagem
      const postImgId = url.split('/').pop();
      if (postImgId) {
        const directUrl = `https://i.postimg.cc/${postImgId}`;
        console.log('URL de imagem extraída do Postimg:', directUrl);
        return directUrl;
      }
    }
    
    // Verificar se temos um link de imagem possivelmente válido sem extensão
    if (url.startsWith('http') && 
        (url.includes('/image/') || url.includes('/images/') || url.includes('/img/') || url.includes('/media/'))) {
      console.log('URL possivelmente válida detectada:', url);
      return url;
    }
    
    return url; // Retornar a URL original como último recurso para permitir tentativa de carregamento
  } catch (error) {
    console.error('Erro ao extrair URL direta da imagem:', error);
    return url; // Retornar a URL original como último recurso para permitir tentativa de carregamento
  }
};

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

  // Estado para controlar a exibição do toast de aviso
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  
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
      } else {        templateData = {
          title: type === 'movie' ? (item as TMDBMovie).title : (item as TVShow).name,
          category: type === 'movie' ? 'Filmes' : 'Séries',
          tmdbId: item.id,
          tmdbType: type,
          tmdbData: item,
          urlImage: item.poster_path ? tmdbService.getImageUrl(item.poster_path) : undefined,
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
    
    // Não permitir alterar a categoria se estiver no modo de edição
    if (field === 'category' && modal.type === 'edit') {
      console.warn('Tentativa de alterar categoria em modo de edição foi bloqueada');
      return;
    }
    
    setModal((m) => {
      if (!m.post) return m;
      
      // Criar uma cópia do objeto post
      const updatedPost = { ...m.post } as any;
      
      // Definir o valor do campo específico
      updatedPost[field] = value;
      
      // Tratamento especial para atualização de categoria apenas na criação
      if (field === 'category' && modal.type === 'create') {
        if (value === 'Filmes') {
          // Se mudar para Filmes, garantir que movieId esteja definido e remover serieId
          updatedPost.serieId = undefined;
          
          // Se houver um tmdbId e o tipo for 'movie', usar como movieId
          if (!updatedPost.movieId && updatedPost.tmdbId && updatedPost.tmdbType === 'movie') {
            updatedPost.movieId = updatedPost.tmdbId;
          }
          
          // Não mostrar erros de movieId ao usuário, apenas log para desenvolvedores
          if (!updatedPost.movieId) {
            console.warn('Categoria Filmes sem ID do filme definido');
          }
          
          // Limpar qualquer erro de ID do storage
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.movieId;
            delete newErrors.serieId;
            return newErrors;
          });
        } else if (value === 'Séries') {
          // Se mudar para Séries, garantir que serieId esteja definido e remover movieId
          updatedPost.movieId = undefined;
          
          // Se houver um tmdbId e o tipo for 'tv', usar como serieId
          if (!updatedPost.serieId && updatedPost.tmdbId && updatedPost.tmdbType === 'tv') {
            updatedPost.serieId = updatedPost.tmdbId;
          }
          
          // Não mostrar erros de serieId ao usuário, apenas log para desenvolvedores
          if (!updatedPost.serieId) {
            console.warn('Categoria Séries sem ID da série definido');
          }
          
          // Limpar qualquer erro de ID do storage
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.serieId;
            delete newErrors.movieId;
            return newErrors;
          });
        }
      }
      
      // Retornar o modal atualizado
      return {
        ...m,
        post: updatedPost
      };
    });
  };// Função para validar o formulário antes de enviar  // Esta função foi substituída por validação direta na função handleSubmit
  // Mantemos o nome e a assinatura da função para compatibilidade com outras partes do código
  const validateForm = () => {
    // Verificamos apenas os campos essenciais: título e conteúdo
    const newErrors: Record<string, string> = {};
    
    if (!modal.post?.title?.trim()) {
      newErrors.title = 'O título é obrigatório';
    }
    
    if (!modal.post?.content?.trim()) {
      newErrors.content = 'O conteúdo é obrigatório';
    } else if (modal.post.content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `O conteúdo excede o limite máximo de ${MAX_CONTENT_LENGTH} caracteres`;
    }
    
    // Não adicionamos erros para categoria, movieId, serieId ou imageUrl
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log completo dos dados antes da validação
    console.log('Dados do formulário antes da validação:', modal.post);
    
    // Aplicar validações finais para garantir que a categoria corresponda aos IDs
    if (modal.post) {
      try {
        // Fazer uma cópia final do post para ajustes
        const finalPost = { ...modal.post };
          // Garantir coerência entre categoria e IDs
        if (finalPost.category === 'Filmes') {
          // Modos diferentes de tratamento baseado no tipo de operação
          if (modal.type === 'edit') {
            // Na edição, preservamos o movieId ou usamos o ID do post como último recurso
            if (!finalPost.movieId && finalPost.id) {
              console.log('Edição - usando ID do post como movieId:', finalPost.id);
              finalPost.movieId = Number(finalPost.id);
            }
          } else {
            // Na criação, tentamos usar tmdbId como movieId
            if (!finalPost.movieId && finalPost.tmdbId && finalPost.tmdbType === 'movie') {
              console.log('Criação - usando tmdbId como movieId:', finalPost.tmdbId);
              finalPost.movieId = finalPost.tmdbId;
            }
          }
          
          // Para garantir que serieId seja undefined quando categoria é Filmes
          finalPost.serieId = undefined;
          console.log('Categoria Filmes: serieId removido, movieId =', finalPost.movieId);
        } else if (finalPost.category === 'Séries') {
          // Modos diferentes de tratamento baseado no tipo de operação
          if (modal.type === 'edit') {
            // Na edição, preservamos o serieId ou usamos o ID do post como último recurso
            if (!finalPost.serieId && finalPost.id) {
              console.log('Edição - usando ID do post como serieId:', finalPost.id);
              finalPost.serieId = Number(finalPost.id);
            }
          } else {
            // Na criação, tentamos usar tmdbId como serieId
            if (!finalPost.serieId && finalPost.tmdbId && finalPost.tmdbType === 'tv') {
              console.log('Criação - usando tmdbId como serieId:', finalPost.tmdbId);
              finalPost.serieId = finalPost.tmdbId;
            }
          }
          
          // Para garantir que movieId seja undefined quando categoria é Séries
          finalPost.movieId = undefined;
          console.log('Categoria Séries: movieId removido, serieId =', finalPost.serieId);
        }
        
        // Atualizar o state com os valores ajustados e depois validar
        setModal(prev => {
          const updatedModal = {
            ...prev,
            post: finalPost
          };
          
          console.log('Estado atualizado antes da validação:', updatedModal.post);          // Executar validação em um callback para garantir que usamos o estado mais recente
          setTimeout(() => {
            // Usar nossa função validateForm para verificar os campos essenciais
            if (!validateForm()) {
              // Se houver erros nos campos essenciais, mostrar alerta
              const criticalErrors = Object.entries(errors)
                .filter(([field]) => field === 'title' || field === 'content')
                .map(([_, message]) => `• ${message}`)
                .join('\n');
              
              setWarningMessage(
                `Por favor, corrija os seguintes campos:\n${criticalErrors}`
              );
              setShowWarning(true);
              
              console.error('Formulário inválido - campos essenciais:', errors);
            } else {
              // Se não houver erros nos campos essenciais, enviar o formulário
              console.log('Enviando formulário validado:', finalPost);
              onSave(finalPost);
            }
          }, 0);
          
          return updatedModal;
        });
      } catch (error) {
        console.error('Erro ao processar formulário:', error);
      }
    } else {
      console.error('Não foi possível enviar: dados do post não encontrados');
    }
  };

  // Componente para exibir resultados da busca TMDB  // Este componente é usado para renderizar os resultados da busca TMDB quando implementado
  // Atualmente, o componente está definido mas a funcionalidade de busca está desativada
  // nesta versão da interface para simplificar o fluxo de edição
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function TMDBSearchResult({ 
    item, 
    type 
  }: { 
    item: TMDBMovie | TVShow; 
    type: 'movie' | 'tv' 
  }) {
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
  }  // Inicializa o formulário com valores adequados
  useEffect(() => {
    // Log para depuração - dados iniciais do post
    console.log('PostForm inicializado com dados:', modal.post);
    
    if (modal.post) {
      const { category, movieId, serieId, tmdbId, tmdbType, id } = modal.post;
      
      console.log('Inicialização:');
      console.log('- ID do post:', id || 'novo post');
      console.log('- Categoria:', category || 'não definida');
      console.log('- movieId:', movieId || 'não definido');
      console.log('- serieId:', serieId || 'não definido');
      console.log('- tmdbId:', tmdbId || 'não definido');
      console.log('- tmdbType:', tmdbType || 'não definido');

      // Modo de edição - garantir que os IDs existentes não sejam perdidos
      if (modal.type === 'edit' && id) {
        console.log(`Modo de edição para post ID ${id}`);
        
        // Garantir que o post tenha os IDs corretos baseados na categoria
        let updatedPost = { ...modal.post };
        let needsUpdate = false;
        
        if (category === 'Filmes') {
          console.log('Edição de post na categoria Filmes');
          
          // Se esse post é um filme mas não tem movieId, tentamos usar o ID do próprio post
          if (!updatedPost.movieId && id) {
            console.log(`Usando ID do post (${id}) como movieId`);
            updatedPost.movieId = Number(id);
            needsUpdate = true;
          }
        } else if (category === 'Séries') {
          console.log('Edição de post na categoria Séries');
          
          // Se esse post é uma série mas não tem serieId, tentamos usar o ID do próprio post
          if (!updatedPost.serieId && id) {
            console.log(`Usando ID do post (${id}) como serieId`);
            updatedPost.serieId = Number(id);
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          setModal(prev => ({
            ...prev,
            post: updatedPost
          }));
        }
      }
      // Se não houver categoria definida para criar um novo post, 
      // definir categoria padrão com base em tmdbType
      else if (!category && modal.type === 'create') {
        let defaultCategory: 'Filmes' | 'Séries' = 'Filmes'; // Definindo o tipo explicitamente
        
        if (tmdbType === 'movie') {
          defaultCategory = 'Filmes';
          console.log('Definindo categoria padrão como Filmes com base em tmdbType');
        } else if (tmdbType === 'tv') {
          defaultCategory = 'Séries';
          console.log('Definindo categoria padrão como Séries com base em tmdbType');
        } else {
          // Padrão para Filmes se não houver informação
          defaultCategory = 'Filmes';
          console.log('Definindo categoria padrão como Filmes (padrão)');
        }
        
        // Atualizar o post com a categoria padrão
        setModal(prev => ({
          ...prev,
          post: {
            ...prev.post!,
            category: defaultCategory
          } as BlogType
        }));
      }
    }
  // Usamos uma função para prevenir loops infinitos com modal.post como dependência
  }, [modal.post, modal.type, setModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect para corrigir IDs com base na categoria quando o post for carregado
  useEffect(() => {
    if (modal.post) {
      const { category, movieId, serieId, tmdbId, tmdbType } = modal.post;
      
      // Se não temos categoria definida, não fazer nada
      if (!category) return;
      
      console.log(`Inicializando post com categoria ${category}`);
      console.log(`Dados atuais: movieId=${movieId}, serieId=${serieId}, tmdbId=${tmdbId}, tmdbType=${tmdbType}`);
      
      // Verifica se precisamos corrigir IDs conforme a categoria
      let needsUpdate = false;
      const updatedPost = { ...modal.post };
      
      if (category === 'Filmes') {
        // Para categoria Filmes, garantir que tenha movieId
        if (!movieId && tmdbId && tmdbType === 'movie') {
          // Usar tmdbId como movieId se for do tipo correto
          console.log(`Corrigindo: definindo movieId=${tmdbId} para categoria Filmes`);
          updatedPost.movieId = tmdbId;
          needsUpdate = true;
        }
        
        // Garantir que serieId seja undefined
        if (serieId !== undefined) {
          console.log('Corrigindo: removendo serieId para categoria Filmes');
          updatedPost.serieId = undefined;
          needsUpdate = true;
        }
      } else if (category === 'Séries') {
        // Para categoria Séries, garantir que tenha serieId
        if (!serieId && tmdbId && tmdbType === 'tv') {
          // Usar tmdbId como serieId se for do tipo correto
          console.log(`Corrigindo: definindo serieId=${tmdbId} para categoria Séries`);
          updatedPost.serieId = tmdbId;
          needsUpdate = true;
        }
        
        // Garantir que movieId seja undefined
        if (movieId !== undefined) {
          console.log('Corrigindo: removendo movieId para categoria Séries');
          updatedPost.movieId = undefined;
          needsUpdate = true;
        }
      }
      
      // Atualizar o post se necessário
      if (needsUpdate) {
        console.log('Atualizando post com IDs corrigidos:', updatedPost);
        setModal(prev => ({
          ...prev,
          post: updatedPost
        }));
      }
    }
  }, [modal.post, setModal]); // Incluindo as dependências necessárias
  // Ocultar o aviso após um tempo
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  return (
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
    >      {/* Alertas de validação - Apenas erros críticos (título e conteúdo) */}
      {(errors.title || errors.content) && (
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
          <AlertTitle>Por favor, corrija os seguintes campos:</AlertTitle>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {errors.title && (
              <Box component="li" key="title">
                {errors.title}
              </Box>
            )}
            {errors.content && (
              <Box component="li" key="content">
                {errors.content}
              </Box>
            )}
          </Box>
        </Alert>
      )}
      
      {/* Toast de aviso */}
      {showWarning && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 9999,
            boxShadow: 3,
            minWidth: '300px',
            maxWidth: '80%',
            animation: 'fadeIn 0.3s',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translate(-50%, -20px)' },
              '100%': { opacity: 1, transform: 'translate(-50%, 0)' }
            }
          }}
          onClose={() => setShowWarning(false)}
        >          <AlertTitle>Atenção</AlertTitle>
          {warningMessage.replace("ID do filme é necessário para categoria Filmes", "").replace("A URL fornecida não é uma imagem válida ou está inacessível", "")}
        </Alert>
      )}
      
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


        <Grid item xs={12}>            <FormControl fullWidth error={!!errors.category} required>
            <InputLabel 
              sx={{
                [`&.MuiInputLabel-shrink`]: {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  background: (theme) => 
                    `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 50%, transparent 50%, transparent 100%)`,
                  padding: '0 4px',
                }
              }}
            >Categoria</InputLabel>            <Select
              value={modal.post?.category || ''}              onChange={(e) => {
                // Só permite alteração quando estiver criando um novo post
                if (modal.type !== 'create') {
                  return;
                }
                
                const newCategory = e.target.value;
                console.log(`Alterando categoria para: ${newCategory}`);
                
                // Atualizar a categoria
                updatePost('category', newCategory);
                
                // Definir automaticamente o ID correto se o post contém dados TMDB
                if (modal.post?.tmdbId && modal.post?.tmdbType) {
                  if (newCategory === 'Filmes' && modal.post.tmdbType === 'movie') {
                    // Usar tmdbId como movieId automaticamente
                    updatePost('movieId', modal.post.tmdbId);
                  } else if (newCategory === 'Séries' && modal.post.tmdbType === 'tv') {
                    // Usar tmdbId como serieId automaticamente
                    updatePost('serieId', modal.post.tmdbId);
                  }
                }
              }}              // Desabilitar o select após a criação inicial do post ou se já existe um ID
              disabled={modal.type === 'edit' || !!modal.post?.id || !!modal.post?.category}
              label="Categoria"
              sx={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                },
                // Estilizar o select quando desabilitado para indicar que é um valor fixo
                '&.Mui-disabled': {
                  opacity: 0.8,
                  color: 'text.primary',
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                }
              }}
            >
              <MenuItem value="Filmes">Filmes</MenuItem>
              <MenuItem value="Séries">Séries</MenuItem>
            </Select>            {/* Não exibir erros de categoria */}
            {/* Exibir mensagem de ajuda sobre a categoria */}
            <FormHelperText>
              {modal.post?.category ? 'A categoria não pode ser alterada após a criação' : 'Selecione a categoria do seu post'}
            </FormHelperText>
            
            {/* Exibir informação do ID associado sem mensagem de erro */}
            {modal.post?.category === 'Filmes' && modal.post?.movieId && (
              <FormHelperText sx={{ color: 'text.secondary' }}>
                ID do filme: {modal.post.movieId}
              </FormHelperText>
            )}
            {modal.post?.category === 'Séries' && modal.post?.serieId && (
              <FormHelperText sx={{ color: 'text.secondary' }}>
                ID da série: {modal.post.serieId}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>        <Grid item xs={12}>            <TextField
            fullWidth
            label="URL da Imagem"
            value={modal.post?.urlImage || modal.post?.imageUrl || ''}
            onChange={(e) => {
              const value = e.target.value;
              
              // Tentar extrair a URL direta da imagem, se for uma URL do Google
              const extractedUrl = extractDirectImageUrl(value);
              const finalValue = extractedUrl || value;
              
              // Guardamos os valores importantes que não devem ser perdidos
              const { category, movieId, serieId, tmdbId, tmdbType } = modal.post || {};
              
              // Logar para depuração
              console.log("Atualizando URL da imagem:", finalValue);
              
              // Atualizamos apenas os campos de imagem
              setModal(prev => ({
                ...prev,
                post: {
                  ...prev.post,
                  urlImage: finalValue,
                  imageUrl: finalValue,
                  // Preservamos explicitamente categoria e IDs
                  category: category,
                  movieId: movieId,
                  serieId: serieId,
                  tmdbId: tmdbId,
                  tmdbType: tmdbType
                } as BlogType
              }));
              
              // Forçar atualização da pré-visualização 
              setTimeout(() => {
                const imgElement = document.querySelector('[data-image-preview="true"]') as HTMLImageElement;
                if (imgElement) {
                  // Forçar recarga da imagem adicionando timestamp
                  imgElement.src = finalValue + (finalValue.includes('?') ? '&' : '?') + 'timestamp=' + new Date().getTime();
                }
              }, 100);
              
              // Remover validação de erro para URL de imagem
              setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.imageUrl;
                return newErrors;
              });
            }}
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
            }}            // Não mostramos erros relacionados à URL da imagem
            helperText="URL da imagem para ilustrar o post (opcional)"
          />          {modal.post?.urlImage && (
            <Box sx={(theme) => ({ 
              mt: 2, 
              p: 2, 
              border: '1px solid', 
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', 
              borderRadius: 2,
              background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            })}>
              <Typography variant="subtitle2" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
                Pré-visualização da imagem:
              </Typography><Box 
                component="img" 
                src={modal.post?.urlImage + (modal.post?.urlImage?.includes('?') ? '&' : '?') + 'timestamp=' + new Date().getTime()}
                alt="Pré-visualização"
                data-image-preview="true"
                loading="eager"
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '4px',
                  backgroundColor: '#f8f8f8'
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  console.log("Erro ao carregar imagem:", e.currentTarget.src);
                  
                  // Se a imagem não carregar, remover a imagem que não funcionou
                  const imgElement = e.currentTarget;
                  imgElement.style.display = 'none';
                  
                  // Verificar se já existe uma mensagem de erro
                  const parentEl = imgElement.parentElement;
                  const errorMessage = parentEl?.querySelector('.image-error-message');
                  if (errorMessage) {
                    errorMessage.textContent = 'A URL fornecida não é uma imagem válida ou está inacessível. Tente outra URL.';
                    return;
                  }
                  
                  // Adicionar uma imagem de fallback com mensagem mais amigável
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'image-error-message';
                  errorDiv.textContent = 'A URL fornecida não é uma imagem válida ou está inacessível. Tente outra URL.';
                  errorDiv.style.padding = '20px';
                  errorDiv.style.textAlign = 'center';
                  errorDiv.style.color = '#999';
                  errorDiv.style.fontStyle = 'italic';
                  parentEl?.appendChild(errorDiv);
                  
                  // Limpar qualquer erro relacionado à imagem para não mostrar ao usuário
                  setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors.imageUrl;
                    return newErrors;
                  });
                }}
              />
            </Box>
          )}
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
                  
                  // Guardamos os valores importantes que não devem ser perdidos
                  const { category, movieId, serieId, tmdbId, tmdbType } = modal.post || {};
                  
                  // Atualizar apenas o valor no state e o contador, preservando categoria e IDs
                  setModal(prev => ({
                    ...prev,
                    post: {
                      ...prev.post,
                      content: value,
                      // Preservamos explicitamente categoria e IDs
                      category: category,
                      movieId: movieId,
                      serieId: serieId,
                      tmdbId: tmdbId,
                      tmdbType: tmdbType
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
            </Button>            <Button
              type="button" // Alterado de submit para button para evitar submissão automática do form
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                console.log('Botão clicado, iniciando validação do formulário');
                handleSubmit(e);
              }}
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
