import axios from 'axios';

import { LoginResponse } from '../types/LoginResponse';
import { LoginRequest } from '../types/LoginRequest';
import { environment } from '../environment/environment';

const API_URL = `${environment.API_URL}/auth/login`;

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(API_URL, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao realizar login.');
    }
    throw new Error('Erro de conexão com o servidor.');
  }
}