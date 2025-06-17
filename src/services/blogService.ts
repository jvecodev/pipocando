import { environment } from "../environment/environment";
import { BlogType, PostRequest } from '../types/BlogRequestResponse';
import { PerfilType, PerfilTypeEnum } from '../types/PerfilType';

const API_URL_V1 = `${environment.API_URL_V1}/post`;
export function canEditPost(user: PerfilType | null, post: BlogType): boolean {
  if (!user) return false;
  if (user.perfil === PerfilTypeEnum.ADMIN) return true;
  // Debug para garantir que os valores estão corretos
  console.log('[canEditPost] user.id:', user.id, 'post.userId:', post.userId, 'result:', String(user.id) === String(post.userId));
  return String(user.id) === String(post.userId);
}

export function canDeletePost(user: PerfilType | null, post: BlogType): boolean {
  return canEditPost(user, post);
}

export async function searchPosts({ title, category, userName }: { title?: string; category?: string; userName?: string }) {
  let url = API_URL_V1 + '/search?';
  const params = [];
  if (category && category !== 'Todas as categorias') params.push(`category=${encodeURIComponent(category)}`);
  if (title) params.push(`title=${encodeURIComponent(title)}`);
  if (userName) params.push(`userName=${encodeURIComponent(userName)}`);
  if (!category || category === 'Todas as categorias') params.push('category=all');
  url += params.join('&');
  
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!res.ok) throw new Error('Erro ao buscar posts');
  return res.json();
}

export async function createPost(post: PostRequest) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para criar uma publicação.');
  }
  
  try {
    // Processar e validar a URL da imagem
    let imageUrl = post.urlImage || post.imageUrl;
    
    // Limitar o tamanho da URL para evitar problemas com o backend
    if (imageUrl && imageUrl.length > 1000) {
      imageUrl = imageUrl.substring(0, 1000);
    }
    
    // Garantir que a categoria seja válida
    const category = post.category;
    
    if (!category || !['Filmes', 'Séries'].includes(category)) {
      throw new Error('Categoria inválida. Deve ser "Filmes" ou "Séries".');
    }
    
    // Preparar os dados para envio
    const postData = { 
      ...post,
      urlImage: imageUrl
    };    // Usar a função utilitária para garantir que os IDs estão corretos baseados na categoria
    const validatedPostData = ensureCategoryIdsAreValid(postData);
    
    // Log para debug dos IDs finais
    if (validatedPostData.category === 'Filmes') {
      console.log(`Criando post de Filmes com movieId=${validatedPostData.movieId}`);
      if (!validatedPostData.movieId) {
        console.warn('ATENÇÃO: Post na categoria Filmes sem movieId definido');
      }
    } else if (validatedPostData.category === 'Séries') {
      console.log(`Criando post de Séries com serieId=${validatedPostData.serieId}`);
      if (!validatedPostData.serieId) {
        console.warn('ATENÇÃO: Post na categoria Séries sem serieId definido');
      }
    }
    
    // Atualizar o postData com os valores validados
    Object.assign(postData, validatedPostData);

    console.log('Dados enviados para criação:', postData);

    const res = await fetch(API_URL_V1, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!res.ok) {
      // Tentar obter mensagem de erro detalhada do backend
      try {
        const errorData = await res.json();
        throw new Error(`Erro ao criar publicação: ${errorData.message || res.statusText}`);
      } catch (e) {
        throw new Error(`Erro ao criar publicação: ${res.status} ${res.statusText}`);
      }
    }
    
    return res.json();
  } catch (error: any) {
    console.error('Erro ao criar post:', error);
    throw error;
  }
}

export async function updatePost(id: number, post: Partial<BlogType>, user: PerfilType | null) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para atualizar a publicação.');
  }

  try {
    // Buscar o post atual para garantir que temos todos os dados necessários
    let currentPost = await getPostById(id);
    // Garante que userId esteja presente para a verificação de permissão
    if (currentPost && (currentPost.userId === undefined || currentPost.userId === null)) {
      currentPost.userId = currentPost.author?.id ?? null;
    }
    if (user && !canEditPost(user, currentPost)) {
      throw new Error('Você não tem permissão para editar esta publicação');
    }
    
    // Processar e validar a URL da imagem
    let imageUrl = post.urlImage || post.imageUrl;
    
    // Limitar o tamanho da URL para evitar problemas com o backend
    if (imageUrl && imageUrl.length > 1000) {
      imageUrl = imageUrl.substring(0, 1000);
    }
    
    // Garantir que a categoria seja preservada
    const category = post.category || currentPost.category;
    
    if (!category || !['Filmes', 'Séries'].includes(category)) {
      throw new Error('Categoria inválida. Deve ser "Filmes" ou "Séries".');
    }
    
    // Preparar os dados para envio, preservando informações importantes
    const postData = {
      ...post,
      urlImage: imageUrl,
      category: category,
    };
      // Usar a função utilitária para garantir que os IDs estão corretos baseados na categoria
    const validatedPostData = ensureCategoryIdsAreValid(postData, currentPost);
    
    // Log para debug dos IDs finais
    if (validatedPostData.category === 'Filmes') {
      console.log(`Atualizando post de Filmes com movieId=${validatedPostData.movieId}`);
      if (!validatedPostData.movieId) {
        console.warn('ATENÇÃO: Post na categoria Filmes continua sem movieId definido');
      }
    } else if (validatedPostData.category === 'Séries') {
      console.log(`Atualizando post de Séries com serieId=${validatedPostData.serieId}`);
      if (!validatedPostData.serieId) {
        console.warn('ATENÇÃO: Post na categoria Séries continua sem serieId definido');
      }
    }
    
    // Atualizar o postData com os valores validados
    Object.assign(postData, validatedPostData);
    
    // Para debug, verificar os dados que estão sendo enviados
    console.log('Dados enviados para atualização:', postData);
    
    const res = await fetch(`${API_URL_V1}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!res.ok) {
      // Tentar obter mensagem de erro detalhada do backend
      try {
        const errorData = await res.json();
        throw new Error(`Erro ao atualizar publicação: ${errorData.message || res.statusText}`);
      } catch (e) {
        throw new Error(`Erro ao atualizar publicação: ${res.status} ${res.statusText}`);
      }
    }
    
    return res.json();
  } catch (error: any) {
    console.error('Erro ao atualizar post:', error);
    throw error;
  }
}

export async function deletePost(id: number, user: PerfilType | null) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para excluir a publicação.');
  }

  let currentPost = await getPostById(id);
  // Garante que userId esteja presente para a verificação de permissão
  if (currentPost && (currentPost.userId === undefined || currentPost.userId === null)) {
    currentPost.userId = currentPost.author?.id ?? null;
  }
  if (user && !canDeletePost(user, currentPost)) {
    throw new Error('Você não tem permissão para excluir esta publicação');
  }

  const res = await fetch(`${API_URL_V1}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) throw new Error('Erro ao deletar publicação');
}

export async function getPostById(id: number): Promise<BlogType> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL_V1}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!res.ok) throw new Error('Erro ao buscar publicação');
  return res.json();
}

// Adiciona um comentário a um post
export async function addCommentToPost(postId: number, content: string, userId?: number, userName?: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL_V1}/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content, userId, userName }),
  });
  if (!res.ok) throw new Error('Erro ao adicionar comentário');
  return res.json();
}

// Lista os comentários de um post
export async function getCommentsByPostId(postId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL_V1}/${postId}/comment`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erro ao buscar comentários');
  return res.json();
}

// Atualiza um comentário
export async function updateComment(commentId: number, content: string, userId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${environment.API_URL_V1}/post/comment/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content, userId }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar comentário');
  return res.json();
}

// Remove um comentário
export async function deleteComment(commentId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${environment.API_URL_V1}/post/comment/${commentId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erro ao remover comentário');
  return res.ok;
}

// Função utilitária para garantir que os IDs estão corretos baseados na categoria
function ensureCategoryIdsAreValid(post: Partial<BlogType>, currentPost?: BlogType): Partial<BlogType> {
  const updatedPost = { ...post };
  const category = post.category;

  if (category === 'Filmes') {
    // Para categoria Filmes, garantir que movieId esteja definido
    if (!updatedPost.movieId && currentPost?.movieId) {
      updatedPost.movieId = currentPost.movieId;
      console.log('Usando movieId existente:', updatedPost.movieId);
    } else if (!updatedPost.movieId && updatedPost.id) {
      updatedPost.movieId = Number(updatedPost.id);
      console.log('Usando ID do post como movieId:', updatedPost.movieId);
    } else if (!updatedPost.movieId && updatedPost.tmdbId && updatedPost.tmdbType === 'movie') {
      updatedPost.movieId = updatedPost.tmdbId;
      console.log('Usando tmdbId como movieId:', updatedPost.movieId);
    }
    
    // Para categoria Filmes, remover serieId
    updatedPost.serieId = undefined;
  } else if (category === 'Séries') {
    // Para categoria Séries, garantir que serieId esteja definido
    if (!updatedPost.serieId && currentPost?.serieId) {
      updatedPost.serieId = currentPost.serieId;
      console.log('Usando serieId existente:', updatedPost.serieId);
    } else if (!updatedPost.serieId && updatedPost.id) {
      updatedPost.serieId = Number(updatedPost.id);
      console.log('Usando ID do post como serieId:', updatedPost.serieId);
    } else if (!updatedPost.serieId && updatedPost.tmdbId && updatedPost.tmdbType === 'tv') {
      updatedPost.serieId = updatedPost.tmdbId;
      console.log('Usando tmdbId como serieId:', updatedPost.serieId);
    }
    
    // Para categoria Séries, remover movieId
    updatedPost.movieId = undefined;
  }

  return updatedPost;
}
