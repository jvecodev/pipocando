import axios from "axios";
import { environment } from "../environment/environment";
import { User } from "../context/UserContext";

const API_URL = environment.API_URL;

interface ProfileUpdateData {
  id: string | number; // Voltando para aceitar string ou number
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

// Função para obter o token do localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const updateUserProfile = async (userData: ProfileUpdateData) => {
  try {
    // Validação básica do ID
    if (!userData.id) {
      console.error("ID do usuário não fornecido para atualização de perfil");
      throw new Error("ID do usuário é necessário para atualização do perfil");
    }

    console.log("Atualizando perfil para o usuário com ID:", userData.id);

    // Preparar os dados a serem enviados
    const dataToSend = {
      name: userData.name,
      email: userData.email,
      currentPassword: userData.currentPassword || undefined,
      newPassword: userData.newPassword || undefined,
    };

    // Remover campos indefinidos
    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key as keyof typeof dataToSend] === undefined) {
        delete dataToSend[key as keyof typeof dataToSend];
      }
    });

    // Fazer a requisição para a API
    const response = await axios.put(
      `${API_URL}/v1/user/${userData.id}/profile`,
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
        // O servidor respondeu com um status de erro
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
        // A requisição foi feita mas não houve resposta
        console.error("Nenhuma resposta recebida:", error.request);
        throw new Error(
          "Servidor não respondeu. Verifique sua conexão de internet."
        );
      }
    }

    // Para outros tipos de erro
    throw new Error("Ocorreu um erro inesperado ao atualizar o perfil.");
  }
};

export const getUserProfile = async (userId: string | number) => {
  try {
    if (!userId) {
      throw new Error("ID do usuário é necessário para obter o perfil");
    }

    const response = await axios.get(`${API_URL}/v1/user/${userId}`, {
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
