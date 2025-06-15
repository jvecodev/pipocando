import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import StarIcon from '@mui/icons-material/Star';
import { BlogType, PostTypeEnum, POST_TYPE_LABELS } from '../../types/BlogRequestResponse';
import tmdbService from '../../services/tmdbService';
import watchlistService from '../../services/watchlistService';

// Styled components
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
}: {
  authors: { name: string; avatar: string }[];
  date?: string;
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
      </Box>
      {date && (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {formatDate(date)}
        </Typography>
      )}
    </Box>
  );
}

// Função para determinar o ícone do tipo de post
function getPostTypeIcon(postType?: string) {
  switch (postType) {
    case PostTypeEnum.NEWS:
      return <NewReleasesIcon color="error" />;
    case PostTypeEnum.REVIEW:
      return <RateReviewIcon color="info" />;
    case PostTypeEnum.LISTICLE:
      return <FormatListNumberedIcon color="success" />;
    default:
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
  };

  // Determina a URL da imagem a ser usada
  const getImageUrl = () => {
    if (post.tmdbData?.poster_path) {
      return tmdbService.getImageUrl(post.tmdbData.poster_path);
    }
    return post.imageUrl || 'https://via.placeholder.com/300x450?text=Sem+Imagem';
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
        
        {/* Badges para categoria e tipo */}
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
              icon={post.category === 'Filmes' ? <MovieIcon fontSize="small" /> : <TvIcon fontSize="small" />}
              label={post.category}
              size="small"
              variant="filled"
              color={post.category === 'Filmes' ? 'primary' : 'secondary'}
              sx={{
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                backgroundColor: post.category === 'Filmes' ? 'primary.main' : 'secondary.main',
                color: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          )}
          
          {post.postType && (
            <Chip
              icon={getPostTypeIcon(post.postType)}
              label={POST_TYPE_LABELS[post.postType as PostTypeEnum] || post.postType}
              size="small"
              variant="filled"
              sx={{ 
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          )}
        </Box>
        
        {/* Badge de destaque */}
        {post.featured && (
          <Chip
            label="Destaque"
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontWeight: 'bold',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        )}
        
        {/* Avaliação para reviews */}
        {post.postType === PostTypeEnum.REVIEW && post.rating !== undefined && (
          <Box
            sx={(theme) => ({
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(0,0,0,0.75)' 
                : 'rgba(255,255,255,0.9)',
              borderRadius: '12px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            })}
          >
            <Rating 
              value={post.rating / 2} 
              precision={0.5} 
              size="small" 
              readOnly 
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />            <Typography 
              variant="body2" 
              fontWeight="bold"
              sx={(theme) => ({
                color: theme.palette.mode === 'dark' ? 'white' : 'text.primary'
              })}
            >
              {post.rating}/10
            </Typography>
          </Box>
        )}
      </Box>

      <StyledCardContent>
        {/* Título do post */}
        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          fontWeight="bold"
          sx={{ mb: 1 }}
        >
          {post.title}
        </Typography>

        {/* Descrição */}
        {post.description && (
          <StyledTypography variant="body2" color="text.secondary" mb={2}>
            {post.description}
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
          
          <Box>
            {onEditClick && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(post);
                }}
                size="small"
                aria-label="editar"
                sx={{ 
                  ml: 1,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                }}
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
                sx={{ 
                  ml: 1,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </StyledCardContent>

      {/* Autor e data */}
      <AuthorDisplay authors={authors} date={post.createdAt} />
    </StyledCard>
  );
}
