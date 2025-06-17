import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById, getCommentsByPostId, addCommentToPost, updateComment, deleteComment } from '../../services/blogService';
import { BlogType } from '../../types/BlogRequestResponse';
import { Box, Typography, Divider, List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../../context/UserContext';
import MainLayout from '../../layout/MainLayout';

const BlogDetail = () => {
  const { postId } = useParams();
  const { user } = useUser();
  const [post, setPost] = useState<BlogType | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!postId) return;
      const postData = await getPostById(Number(postId));
      const commentsData = await getCommentsByPostId(Number(postId));
      setPost(postData);
      setComments(commentsData);
      setLoading(false);
    };
    fetchData();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId || !user) return;
    setCommentLoading(true);
    await addCommentToPost(Number(postId), newComment, Number(user.id));
    const commentsData = await getCommentsByPostId(Number(postId));
    setComments(commentsData);
    setNewComment('');
    setCommentLoading(false);
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = async (commentId: number) => {
    if (!user) return;
    await updateComment(commentId, editCommentText, Number(user.id));
    const commentsData = await getCommentsByPostId(Number(postId));
    setComments(commentsData);
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteComment(commentId);
    const commentsData = await getCommentsByPostId(Number(postId));
    setComments(commentsData);
  };

  if (loading) return null;
  if (!post) return <Typography>Post não encontrado.</Typography>;

  return (
    <MainLayout>
      <Box maxWidth="lg" mx="auto" mt={4} mb={8} sx={{ textAlign: 'left', pl: 0, pr: { xs: 1, sm: 0 } }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} alignItems={{ md: 'flex-start' }}>
          {/* Imagem do post */}
          {post.urlImage || post.imageUrl ? (
            <Box flexShrink={0} width={{ xs: '100%', md: 180 }}>
              <img
                src={post.urlImage || post.imageUrl}
                alt={post.title}
                style={{
                  width: '100%',
                  maxWidth: 180,
                  borderRadius: 12,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                  objectFit: 'cover',
                  display: 'block',
                  margin: 0
                }}
              />
            </Box>
          ) : null}
          {/* Informações do post */}
          <Box flex={1}>
            <Typography variant="h4" gutterBottom>{post.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {post.author?.name || 'Autor'} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
            </Typography>
            {/* Nome do filme ou série */}
            {post.tmdbData?.title || post.tmdbData?.name ? (
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                {post.tmdbData.title || post.tmdbData.name}
              </Typography>
            ) : null}
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 3 }}>{post.content}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Comentários</Typography>
        <List>
          {comments.length === 0 && <ListItem><ListItemText primary="Nenhum comentário ainda." /></ListItem>}
          {comments.map((comment, idx) => {
            const canEditOrDelete = user && (
              user.perfil === 'ADMIN' || comment.userId === Number(user.id)
            );
            return (
              <ListItem key={idx} alignItems="flex-start" secondaryAction={
                canEditOrDelete && (
                  <>
                    <Button size="small" onClick={() => handleEditComment(comment)} startIcon={<EditIcon />}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteComment(comment.id)} startIcon={<DeleteIcon />}>Excluir</Button>
                  </>
                )
              }>
                {editingCommentId === comment.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      value={editCommentText}
                      onChange={e => setEditCommentText(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Button size="small" variant="contained" onClick={() => handleSaveEditComment(comment.id)} disabled={!editCommentText.trim()}>
                      Salvar
                    </Button>
                    <Button size="small" onClick={() => setEditingCommentId(null)} sx={{ ml: 1 }}>
                      Cancelar
                    </Button>
                  </Box>
                ) : (
                  <ListItemText
                    primary={comment.userName || comment.author?.name || 'Anônimo'}
                    secondary={comment.content}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
        <Box
          mt={2}
          display="flex"
          gap={2}
          sx={{
            bgcolor: theme => theme.palette.mode === 'dark' ? '#23272f' : '#fff',
            color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
            borderRadius: 2,
            p: 2
          }}
        >
          <TextField
            label="Adicionar comentário"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={commentLoading}
            InputProps={{
              sx: {
          bgcolor: theme => theme.palette.mode === 'dark' ? '#23272f' : '#fff',
          color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000'
              }
            }}
            InputLabelProps={{
              sx: {
          color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={commentLoading || !newComment.trim()}
            sx={{
              bgcolor: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
              color: theme => theme.palette.mode === 'dark' ? '#23272f' : '#fff',
              '&:hover': {
          bgcolor: theme => theme.palette.mode === 'dark' ? '#e0e0e0' : '#222'
              }
            }}
          >
            Comentar
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default BlogDetail;
