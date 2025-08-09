import axios from "axios";
import { environment } from "../environment/environment";

const API_URL = environment.API_URL;

// Add an interface for the login request
export interface LoginRequest {
  email: string;
  password: string;
}

export const login = async (loginRequest: LoginRequest) => {
  const { email, password } = loginRequest;
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    // Store token and user info in localStorage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userName", response.data.userName);
    localStorage.setItem("userRole", response.data.role);
    
    // Store userId as string (will be parsed to number when needed)
    localStorage.setItem("userId", response.data.userId.toString());

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Falha na autenticação");
    }
    throw new Error("Erro ao conectar com o servidor");
  }
};
