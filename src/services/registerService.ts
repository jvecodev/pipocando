import axios from 'axios';

import { environment } from '../environment/environment';
import { RegisterRequest } from '../types/RegisterRequest';
import { RegisterResponse } from '../types/RegisterResponse';

const API_URL_V1 = `${environment.API_URL_V1}/user`;

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await axios.post<RegisterResponse>(API_URL_V1, data);
    console.log("sucess", response)
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log("if erro", error.response)
      throw new Error(error.response.data.message || 'Erro ao realizar cadastro.');
    }
    console.log("if erro", error)
    throw new Error('Erro de conexão com o servidor.');
  }
}