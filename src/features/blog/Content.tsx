import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import AddIcon from '@mui/icons-material/Add';
import { createPost, deletePost, searchPosts, updatePost } from '../../services/blogService';
import { BlogType } from '../../types/BlogRequestResponse';
import { useUser } from '../../context/UserContext';
import { PerfilTypeEnum } from '../../types/PerfilType';
import StandardModal from '../../organisms/dialog/StandardModal';
import DeleteConfirmationModal from '../../organisms/dialog/DeleteConfirmationModal';
import { CategoriaPostEnum, Movie, Serie } from '../../types/CategoriaPostEnum';
import { fetchMovies, fetchSeries } from '../../services/mediaService';
import PostForm from './PostForm';
import BlogCardItem from './BlogCardItem';

const CATEGORIES = [
  { label: 'Todas as categorias', value: 'all' },
  { label: 'Filmes', value: 'Filmes' },
  { label: 'Séries', value: 'Séries' },
];

export default function Content() {
  const [posts, setPosts] = React.useState<BlogType[]>([]);
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const { user, setUser } = useUser();
  const [category, setCategory] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');
  const [modal, setModal] = React.useState<{
    open: boolean;
    type: 'create' | 'edit' | 'delete' | null;
    post?: BlogType | null;
  }>({ open: false, type: null, post: null });
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [postToDelete, setPostToDelete] = React.useState<BlogType | null>(null);
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [series, setSeries] = React.useState<Serie[]>([]);

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

  React.useEffect(() => {
    if (modal.open && (modal.type === 'create' || modal.type === 'edit')) {
      if (modal.post?.category === CategoriaPostEnum.FILME) {
        fetchMovies().then(setMovies);
      } else if (modal.post?.category === CategoriaPostEnum.SERIE) {
        fetchSeries().then(setSeries);
      }
    }
  }, [modal.open, modal.type, modal.post?.category]);

  const handleFocus = (index: number) => setFocusedCardIndex(index);
  const handleBlur = () => setFocusedCardIndex(null);
  const handleCategory = (cat: string) => setCategory(cat);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleOpenModal = (type: 'create' | 'edit' | 'delete', post?: BlogType) => {
    if (type === 'delete' && post) {
      setPostToDelete(post);
      setDeleteModalOpen(true);
    } else {
      setModal({ open: true, type, post });
    }
  };
  const handleCloseModal = () => {
    setModal({ open: false, type: null, post: null });
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (postToDelete?.id) {
      try {
        await deletePost(Number(postToDelete.id));
        fetchPosts();
      } catch (e) {
        alert('Erro ao deletar publicação');
      }
    }
    handleCloseModal(); // Fecha ambas as modais e reseta estados
  };

  const handleConfirmModal = async () => {
    try {
      if (modal.type === 'create') {
        if (!modal.post?.title || !modal.post?.content || !user?.id) throw new Error('Preencha os campos obrigatórios');
        await createPost({
          title: modal.post.title,
          content: modal.post.content,
          userId: Number(user.id),
          movieId: modal.post.movieId ? Number(modal.post.movieId) : undefined,
          serieId: modal.post.serieId ? Number(modal.post.serieId) : undefined,
        });
        fetchPosts();
      } else if (modal.type === 'edit' && modal.post?.id) {
        await updatePost(Number(modal.post.id), modal.post);
        fetchPosts();
      }
    } catch (e) {
      alert('Erro ao processar ação');
    }
    handleCloseModal();
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h1" gutterBottom>
            Blog
          </Typography>
          <Typography>Confira as últimas publicações do Pipocando</Typography>
        </div>
        {user?.perfil === PerfilTypeEnum.ADMIN && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal('create')}
          >
            Criar Nova
          </Button>
        )}
      </Box>
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
            <BlogCardItem
              post={post}
              user={user}
              onEdit={() => handleOpenModal('edit', post)}
              onDelete={() => handleOpenModal('delete', post)}
              onFocus={() => handleFocus(idx)}
              onBlur={handleBlur}
              isFocused={focusedCardIndex === idx}
            />
          </Grid>
        ))}
      </Grid>
      <StandardModal
        open={modal.open && modal.type !== 'delete'}
        title={modal.type === 'create' ? 'Criar Publicação' : 'Editar Publicação'}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        confirmText='Salvar'
        cancelText="Cancelar"
      >
        <PostForm modal={modal} setModal={setModal} movies={movies} series={series} />
      </StandardModal>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseModal} // Reutiliza handleCloseModal para fechar e resetar
        onConfirm={handleDeleteConfirm}
        itemName={postToDelete?.title}
        title="Deletar Publicação"
        message={`Tem certeza que deseja deletar a publicação "${postToDelete?.title || 'esta publicação'}"?`}
      />
    </Box>
  );
}