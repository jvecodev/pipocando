import { environment } from "../environment/environment";
import { BlogType } from '../types/BlogRequestResponse';

const API_URL_V1 = `${environment.API_URL_V1}/post`;

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

export async function createPost(post: { title: string; content: string; userId: number; movieId?: number; serieId?: number; tmdbId?: number; tmdbType?: 'movie' | 'tv'; tmdbData?: any; postType?: 'news' | 'review' | 'listicle' | 'general'; featured?: boolean; rating?: number }) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL_V1, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Erro ao criar publicação');
  return res.json();
}

export async function updatePost(id: number, post: Partial<BlogType>) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL_V1}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Erro ao atualizar publicação');
  return res.json();
}

export async function deletePost(id: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL_V1}/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erro ao deletar publicação');
}
