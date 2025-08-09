import React, { useEffect, useState } from 'react';
import { getPostById, getCommentsByPostId, addCommentToPost, updateComment, deleteComment } from '../../services/blogService';
import { BlogType } from '../../types/BlogRequestResponse';
import { 
  Box, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Button,
  Dialog,
  DialogContent,
  IconButton,
  styled
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from '../../context/UserContext';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    maxWidth: '900px',
    width: '90vw',
    maxHeight: '90vh',
    backgroundImage:
      theme.palette.mode === 'dark'
        ? "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(210, 100%, 16%, 0.5), transparent)"
        : "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(211, 100%, 83.1%, 0.3), transparent)",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: theme.spacing(2),
}));

interface BlogDetailModalProps {
  open: boolean;
  postId: number | null;
  onClose: () => void;
}

const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ open, postId, onClose }) => {
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
      if (!open || !postId) {
        setPost(null);
        setComments([]);
        setLoading(true);
        return;
      }
      
      setLoading(true);
      try {
        const postData = await getPostById(postId);
        const commentsData = await getCommentsByPostId(postId);
        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        console.error('Erro ao carregar dados do post:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [postId, open]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId || !user) return;
    setCommentLoading(true);
    try {
      await addCommentToPost(postId, newComment, Number(user.id));
      const commentsData = await getCommentsByPostId(postId);
      setComments(commentsData);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = async (commentId: number) => {
    if (!user) return;
    try {
      await updateComment(commentId, editCommentText, Number(user.id));
      const commentsData = await getCommentsByPostId(postId!);
      setComments(commentsData);
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      const commentsData = await getCommentsByPostId(postId!);
      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  const handleClose = () => {
    setPost(null);
    setComments([]);
    setNewComment('');
    setEditingCommentId(null);
    setEditCommentText('');
    onClose();
  };

  if (!post && !loading) {
    return null;
  }

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="blog-detail-modal"
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" component="h2">
            Detalhes da Publicação
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <StyledDialogContent>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando...</Typography>
          </Box>
        ) : post ? (
          <>
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
              {comments.length === 0 && (
                <ListItem>
                  <ListItemText primary="Nenhum comentário ainda." />
                </ListItem>
              )}
              {comments.map((comment, idx) => {
                const canEditOrDelete = user && (
                  user.perfil === 'ADMIN' || comment.userId === Number(user.id)
                );
                return (
                  <ListItem 
                    key={idx} 
                    alignItems="flex-start" 
                    secondaryAction={
                      canEditOrDelete && (
                        <Box>
                          <Button 
                            size="small" 
                            onClick={() => handleEditComment(comment)} 
                            startIcon={<EditIcon />}
                          >
                            Editar
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteComment(comment.id)} 
                            startIcon={<DeleteIcon />}
                          >
                            Excluir
                          </Button>
                        </Box>
                      )
                    }
                  >
                    {editingCommentId === comment.id ? (
                      <Box sx={{ width: '100%' }}>
                        <TextField
                          value={editCommentText}
                          onChange={e => setEditCommentText(e.target.value)}
                          fullWidth
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => handleSaveEditComment(comment.id)} 
                          disabled={!editCommentText.trim()}
                        >
                          Salvar
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => setEditingCommentId(null)} 
                          sx={{ ml: 1 }}
                        >
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
          </>
        ) : (
          <Typography>Post não encontrado.</Typography>
        )}
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default BlogDetailModal;
