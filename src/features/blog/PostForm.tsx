import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { BlogType } from '../../types/BlogRequestResponse';
import { CategoriaPostEnum, Movie, Serie } from '../../types/CategoriaPostEnum';
import PostSelectField from './PostSelectField';

// Utilitário para atualizar campos do post na modal
function updateModalPost(setModal: any, field: string, value: any) {
  setModal((m: any) => ({
    ...m,
    post: { ...((m.post as BlogType) || {}), [field]: value }
  }));
}

interface PostFormProps {
  modal: any;
  setModal: any;
  movies: Movie[];
  series: Serie[];
}

export default function PostForm({ modal, setModal, movies, series }: PostFormProps) {
  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <FormControl fullWidth variant="outlined" margin="dense">
        <OutlinedInput
          placeholder="Título"
          value={modal.post?.title || ''}
          onChange={e => updateModalPost(setModal, 'title', e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" margin="dense" sx={{ alignItems: 'flex-start' }}>
        <OutlinedInput
          placeholder="Conteúdo"
          value={modal.post?.content || ''}
          onChange={e => updateModalPost(setModal, 'content', e.target.value)}
          sx={{ width: '100%' }}
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" margin="dense" sx={{ minWidth: 120 }}>
        <Select
          displayEmpty
          value={modal.post?.category || ''}
          onChange={e => updateModalPost(setModal, 'category', e.target.value)}
          renderValue={selected => selected ? selected : <span style={{ color: 'rgba(0,0,0,0.6)' }}>Categoria</span>}
          sx={{ width: '100%' }}
        >
          <MenuItem value="" disabled>
            <em style={{ color: 'rgba(0,0,0,0.6)' }}>Categoria</em>
          </MenuItem>
          <MenuItem value={CategoriaPostEnum.FILME}>Filmes</MenuItem>
          <MenuItem value={CategoriaPostEnum.SERIE}>Séries</MenuItem>
        </Select>
      </FormControl>
      {modal.post?.category === CategoriaPostEnum.FILME && (
        <PostSelectField
          value={modal.post?.movieId || ''}
          onChange={id => setModal((m: any) => ({ ...m, post: { ...((m.post as BlogType) || {}), movieId: id, serieId: undefined } }))}
          options={movies}
          placeholder="Filme"
        />
      )}
      {modal.post?.category === CategoriaPostEnum.SERIE && (
        <PostSelectField
          value={modal.post?.serieId || ''}
          onChange={id => setModal((m: any) => ({ ...m, post: { ...((m.post as BlogType) || {}), serieId: id, movieId: undefined } }))}
          options={series}
          placeholder="Série"
        />
      )}
    </Box>
  );
}
