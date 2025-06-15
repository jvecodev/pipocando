import React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BlogType } from '../../types/BlogRequestResponse';
import { PerfilType, PerfilTypeEnum } from '../../types/PerfilType';
import { User } from '../../context/UserContext'; // Importe a interface User

// Styled components (movidos de Content.tsx)
const SyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const SyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// Componente Author (movido de Content.tsx)
function AuthorDisplay({ authors }: { authors: { name: string; avatar: string }[] }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
      >
        <AvatarGroup max={3}>
          {authors.map((author, index) => (
            <Avatar
              key={index}
              alt={author.name}
              src={author.avatar}
              sx={{ width: 24, height: 24 }}
            />
          ))}
        </AvatarGroup>
        <Typography variant="caption">
          {authors.map((author) => author.name).join(', ')}
        </Typography>
      </Box>
      <Typography variant="caption">{/* TODO: Adicionar data do post aqui */}</Typography>
    </Box>
  );
}

interface BlogCardItemProps {
  post: BlogType;
  user: User | null;  // Alterado de PerfilType | null para User | null
  onEdit: (post: BlogType) => void;
  onDelete: (post: BlogType) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
}

export default function BlogCardItem({
  post,
  user,
  onEdit,
  onDelete,
  onFocus,
  onBlur,
  isFocused,
}: BlogCardItemProps) {
  return (
    <SyledCard
      variant="outlined"
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={0}
      className={isFocused ? 'Mui-focused' : ''}
      sx={{ height: '100%' }}
    >
      <CardMedia
        component="img"
        alt={post.title || 'Imagem do post'}
        image={post.imageUrl || 'https://picsum.photos/800/450?random=' + post.id}
        sx={{
          aspectRatio: '16 / 9',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      />
      <SyledCardContent>
        <Typography gutterBottom variant="caption" component="div">
          {post.category || post.tag || ''}
        </Typography>
        <Typography gutterBottom variant="h6" component="div">
          {post.title}
        </Typography>
        <StyledTypography variant="body2" color="text.secondary" gutterBottom>
          {post.content || post.description}
        </StyledTypography>
      </SyledCardContent>
      <AuthorDisplay authors={
        post.author
          ? [
              typeof post.author === 'string'
                ? { name: post.author, avatar: '' }
                : { name: post.author.name || 'Desconhecido', avatar: post.author.avatar || '' }
            ]
          : [{ name: 'Desconhecido', avatar: '' }]
      } />
      {user?.perfil === PerfilTypeEnum.ADMIN && (
        <Box sx={{ display: 'flex', gap: 1, p: 1, justifyContent: 'flex-end' }}>
          <IconButton color="primary" aria-label="editar" onClick={() => onEdit(post)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" aria-label="apagar" onClick={() => onDelete(post)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </SyledCard>
  );
}
