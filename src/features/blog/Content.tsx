import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import { searchPosts } from '../../services/blogService';
import { BlogType } from '../../types/BlogRequestResponse';

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

function Author({ authors }: { authors: { name: string; avatar: string }[] }) {
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
      <Typography variant="caption">07/02/2025</Typography>
    </Box>
  );
}

// Centralize as categorias em um array
const CATEGORIES = [
  { label: 'Todas as categorias', value: 'all' },
  { label: 'Filmes', value: 'Filmes' },
  { label: 'Séries', value: 'Séries' },
];

export default function Content() {
  const [posts, setPosts] = React.useState<BlogType[]>([]);
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const [category, setCategory] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');

  const fetchPosts = React.useCallback(() => {
    searchPosts({
      title: search.trim() ? search : undefined,
      category,
    })
      .then(data => setPosts(data))
      .catch(e => {
        setPosts([]);
        console.error('Erro ao buscar posts:', e);
      });
  }, [search, category]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFocus = (index: number) => setFocusedCardIndex(index);
  const handleBlur = () => setFocusedCardIndex(null);
  const handleCategory = (cat: string) => setCategory(cat);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  // Função para renderizar os chips de categoria
  const renderCategoryChips = () => (
    CATEGORIES.map(cat => (
      <Chip
        key={cat.value}
        onClick={() => handleCategory(cat.value)}
        size="medium"
        label={category === cat.value ? `● ${cat.label}` : cat.label}
        sx={theme => ({
          backgroundColor: category === cat.value ? theme.palette.primary.main + 'CC' : 'transparent',
          color: category === cat.value ? theme.palette.primary.contrastText : 'inherit',
          border: 'none',
          fontWeight: category === cat.value ? 700 : 400,
          transition: 'background 0.2s',
        })}
      />
    ))
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          Blog
        </Typography>
        <Typography>Confira as últimas publicações do Pipocando</Typography>
      </div>
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
          <OutlinedInput
            size="small"
            id="search"
            placeholder="Pesquisar..."
            sx={{ flexGrow: 1 }}
            value={search}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start" sx={{ color: 'text.primary' }}>
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            }
            inputProps={{
              'aria-label': 'search',
            }}
          />
        </FormControl>
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'row',
            gap: 3,
            overflow: 'auto',
          }}
        >
          {renderCategoryChips()}
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'row',
            gap: 1,
            width: { xs: '100%', md: 'fit-content' },
            overflow: 'auto',
          }}
        >
          <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
            <OutlinedInput
              size="small"
              id="search"
              placeholder="Pesquisar..."
              sx={{ flexGrow: 1 }}
              value={search}
              onChange={handleSearch}
              startAdornment={
                <InputAdornment position="start" sx={{ color: 'text.primary' }}>
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              }
              inputProps={{
                'aria-label': 'search',
              }}
            />
          </FormControl>
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      <Grid container spacing={2} columns={12}>
        {Array.isArray(posts) && posts.map((post, idx) => (
          <Grid key={post.id || idx} size={{ xs: 12, md: 6, lg: 4 }}>
            <SyledCard
              variant="outlined"
              onFocus={() => handleFocus(idx)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === idx ? 'Mui-focused' : ''}
              sx={{ height: '100%' }}
            >
              <CardMedia
                component="img"
                alt={post.title || 'Imagem do post'}
                image={post.imageUrl || 'https://picsum.photos/800/450?random=' + idx}
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
              <Author authors={
                post.author
                  ? [
                      typeof post.author === 'string'
                        ? { name: post.author, avatar: '' }
                        : { name: post.author.name || 'Desconhecido', avatar: post.author.avatar || '' }
                    ]
                  : [{ name: 'Desconhecido', avatar: '' }]
              } />
            </SyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}