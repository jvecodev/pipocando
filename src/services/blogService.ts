import { environment } from "../environment/environment";
import { BlogType, PostRequest } from '../types/BlogRequestResponse';
import { PerfilType, PerfilTypeEnum } from '../types/PerfilType';

const API_URL_V1 = `${environment.API_URL_V1}/post`;
export function canEditPost(user: PerfilType | null, post: BlogType): boolean {
  if (!user) return false;
  
  if (user.perfil === PerfilTypeEnum.ADMIN) return true;
  
  return user.id === String(post.userId);
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

  const res = await fetch(API_URL_V1, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });
  
  if (!res.ok) throw new Error('Erro ao criar publicação');
  return res.json();
}

export async function updatePost(id: number, post: Partial<BlogType>, user: PerfilType | null) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para atualizar a publicação.');
  }

  const currentPost = await getPostById(id);
  
  if (user && !canEditPost(user, currentPost)) {
    throw new Error('Você não tem permissão para editar esta publicação');
  }

  const res = await fetch(`${API_URL_V1}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });
  
  if (!res.ok) throw new Error('Erro ao atualizar publicação');
  return res.json();
}

export async function deletePost(id: number, user: PerfilType | null) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para excluir a publicação.');
  }

  const currentPost = await getPostById(id);
  
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
