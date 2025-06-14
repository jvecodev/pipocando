import { environment } from "../environment/environment";

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
