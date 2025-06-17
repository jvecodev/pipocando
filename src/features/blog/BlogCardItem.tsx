import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import { BlogType } from '../../types/BlogRequestResponse';
import tmdbService from '../../services/tmdbService';
import watchlistService from '../../services/watchlistService';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: theme.palette.primary.main + '80',
    outlineOffset: '2px',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 24,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 24,
  },
}));

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// Formata a data no formato dd/mm/aaaa
function formatDate(dateString?: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

// Componente para exibir o autor
function AuthorDisplay({
  authors,
  date,
  onEditClick,
  onDeleteClick,
  post
}: {
  authors: { name: string; avatar: string }[];
  date?: string;
  onEditClick?: (post: BlogType) => void;
  onDeleteClick?: (post: BlogType) => void;
  post: BlogType;
}) {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        width: '100%',
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.08)',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AvatarGroup
          max={3}
          sx={{
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              fontSize: 14,
              border: '2px solid white',
            },
          }}
        >
          {authors.map((author, index) => (
            <Avatar key={index} alt={author.name} src={author.avatar} />
          ))}
        </AvatarGroup>
        <Typography variant="body2" color="text.secondary">
          {authors
            .map((author) => author.name)
            .join(', ')
            .substring(0, 30)}
          {authors.map((author) => author.name).join(', ').length > 30 && '...'}
        </Typography>
        {/* Botões ao lado do nome do autor */}
        {onEditClick && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(post);
            }}
            size="small"
            aria-label="editar"
            sx={{ ml: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        {onDeleteClick && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(post);
            }}
            size="small"
            aria-label="deletar"
            color="error"
            sx={{ ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {date && (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {formatDate(date)}
        </Typography>
      )}
    </Box>
  );
}

// Função para determinar o ícone baseado na categoria
function getCategoryIcon(category?: string) {
  if (category === 'Filmes') {
    return <MovieIcon color="primary" />;
  } else if (category === 'Séries') {
    return <TvIcon color="secondary" />;
  } else {
    return <FeaturedPlayListIcon color="action" />;
  }
}

interface BlogCardItemProps {
  post: BlogType;
  onEditClick?: (post: BlogType) => void;
  onDeleteClick?: (post: BlogType) => void;
  onCardClick?: (post: BlogType) => void;
  isFocused?: boolean;
}

export default function BlogCardItem({
  post,
  onEditClick,
  onDeleteClick,
  onCardClick,
  isFocused = false,
}: BlogCardItemProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  
  useEffect(() => {
    // Verifica se o item está na watchlist quando o post é carregado
    if (post.tmdbId && post.tmdbType) {
      setInWatchlist(watchlistService.isInWatchlist(post.tmdbId, post.tmdbType));
    }
  }, [post.tmdbId, post.tmdbType]);

  // Manipuladores para a watchlist
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!post.tmdbId || !post.tmdbType || !post.tmdbData) return;
    
    if (inWatchlist) {
      watchlistService.removeFromWatchlist(post.tmdbId, post.tmdbType);
      setInWatchlist(false);
    } else {
      watchlistService.addToWatchlist(post.tmdbData, post.tmdbType);
      setInWatchlist(true);
    }
  };  // Determina a URL da imagem a ser usada
  const getImageUrl = () => {
    // Ordem de prioridade para compatibilidade:
    // 1. urlImage (do banco de dados)
    // 2. imageUrl (para compatibilidade com frontend antigo)
    // 3. Imagem do TMDB se disponível
    // 4. Placeholder como último recurso
    
    if (post.urlImage) {
      return post.urlImage;
    }
    
    if (post.imageUrl) {
      return post.imageUrl;
    }
    
    if (post.tmdbData?.poster_path) {
      return tmdbService.getImageUrl(post.tmdbData.poster_path);
    }
    
    return 'https://via.placeholder.com/300x450?text=Sem+Imagem';
  };

  // Mock de autor para teste
  const authors = [
    { name: post.author?.name || 'Autor Desconhecido', avatar: post.author?.avatar || '' },
  ];

  return (
    <StyledCard
      tabIndex={0}
      role="button"
      aria-pressed="false"
      onClick={() => onCardClick?.(post)}
      sx={{
        outline: isFocused ? '3px solid hsl(210, 100%, 48%)' : 'none',
      }}
    >
      {/* Imagem de capa com badges */}
      <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={getImageUrl()}
          alt={post.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        
        {/* Badge para categoria */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          {post.category && (
            <Chip
              icon={getCategoryIcon(post.category)}
              label={post.category}
              size="small"
              variant="filled"
              color={post.category === 'Filmes' ? 'primary' : 'secondary'}
              sx={{
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                color: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          )}
        </Box>
      </Box>

      <StyledCardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="h6"
            component="h2"
            fontWeight="bold"
            sx={{ mr: 1 }}
          >
            {post.title}
          </Typography>
        </Box>
        {/* Adiciona o conteúdo do post */}
        {post.content && (
          <StyledTypography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {post.content}
          </StyledTypography>
        )}

        {/* Botões de ação */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 'auto',
          }}
        >
          {/* Watchlist toggle se tiver tmdbId */}
          {post.tmdbId && post.tmdbType && (
            <IconButton 
              onClick={handleWatchlistToggle} 
              size="small"
              color="primary"
              aria-label={inWatchlist ? "Remover da Watchlist" : "Adicionar à Watchlist"}
              sx={{ 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              }}
            >
              {inWatchlist ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          )}
        </Box>
      </StyledCardContent>

      {/* Autor e data */}
      <AuthorDisplay 
        authors={authors} 
        date={post.createdAt} 
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        post={post}
      />
    </StyledCard>
  );
}
