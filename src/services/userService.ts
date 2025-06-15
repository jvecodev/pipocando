import axios from "axios";
import { environment } from "../environment/environment";
import { User } from "../context/UserContext";

const API_URL = environment.API_URL;

interface ProfileUpdateData {
  id: number; // Changed to number to match INT in database
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

// Function to get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Function to get the user ID from localStorage
const getUserId = () => {
  return localStorage.getItem("userId");
};

export const updateUserProfile = async (userData: ProfileUpdateData) => {
  try {
    // Get user ID from localStorage if not provided
    const userId = userData.id || getUserId();
    
    if (!userId) {
      console.error("ID do usuário não fornecido para atualização de perfil");
      throw new Error("ID do usuário é necessário para atualização do perfil");
    }

    console.log("Atualizando perfil para o usuário com ID:", userId);

    // Prepare the data to be sent
    const dataToSend = {
      name: userData.name,
      email: userData.email,
      currentPassword: userData.currentPassword || undefined,
      newPassword: userData.newPassword || undefined,
    };

    // Remove undefined fields
    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key as keyof typeof dataToSend] === undefined) {
        delete dataToSend[key as keyof typeof dataToSend];
      }
    });

    // Make request to the API
    const response = await axios.put(
      `${API_URL}/v1/user/${userId}`,
      dataToSend,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    console.log("Resposta da API após atualização de perfil:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with an error status
        console.error("Resposta de erro do servidor:", error.response.data);

        if (error.response.status === 401) {
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        } else if (error.response.status === 403) {
          throw new Error("Você não tem permissão para atualizar este perfil.");
        } else if (error.response.status === 404) {
          throw new Error("Usuário não encontrado.");
        }

        throw new Error(
          error.response.data.message || "Erro ao atualizar o perfil"
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Nenhuma resposta recebida:", error.request);
        throw new Error(
          "Servidor não respondeu. Verifique sua conexão de internet."
        );
      }
    }

    // For other types of errors
    throw new Error("Ocorreu um erro inesperado ao atualizar o perfil.");
  }
};

export const getUserProfile = async (userId?: string | number) => {
  try {
    // Use the provided userId or get it from localStorage
    const id = userId || getUserId();
    
    if (!id) {
      throw new Error("ID do usuário é necessário para obter o perfil");
    }
    
    const response = await axios.get(`${API_URL}/v1/user/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao obter perfil do usuário"
        );
      }
    }

    throw new Error("Erro ao conectar com o servidor");
  }
};

// Outras funções relacionadas a usuário que você possa precisar
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/v1/user`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao buscar usuários"
        );
      }
    }

    throw new Error("Erro ao conectar com o servidor");
  }
};

export const deleteUser = async (userId: string | number) => {
  try {
    if (!userId) {
      throw new Error("ID do usuário é necessário para excluir");
    }

    const response = await axios.delete(`${API_URL}/v1/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao excluir usuário"
        );
      }
    }

    throw new Error("Erro ao conectar com o servidor");
  }
};

export const createUser = async (userData: Omit<User, "id">) => {
  try {
    const response = await axios.post(`${API_URL}/v1/user`, userData, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data.message || "Erro ao criar usuário");
      }
    }

    throw new Error("Erro ao conectar com o servidor");
  }
};
