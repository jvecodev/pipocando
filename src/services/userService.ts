import axios from "axios";
import { environment } from "../environment/environment";
import { RegisterRequest } from "../types/RegisterRequest";

const API_URL = environment.API_URL;

// Make the interface exported
export interface ProfileUpdateData {
  id: number;
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
  const userId = localStorage.getItem("userId");
  return userId ? parseInt(userId) : null;
};

export const updateUserProfile = async (userData: ProfileUpdateData) => {
  try {
    // Obter o ID do usuário (já está incluído no userData)
    const userId = userData.id;

    if (!userId) {
      throw new Error("ID do usuário é necessário para atualização do perfil");
    }

    // Preparar dados para envio com tipagem correta
    const dataToSend: {
      name: string;
      email: string;
      currentPassword?: string;
      newPassword?: string;
    } = {
      name: userData.name,
      email: userData.email,
    };

    // Adicionar campos de senha apenas se estiverem presentes
    if (userData.currentPassword && userData.newPassword) {
      dataToSend.currentPassword = userData.currentPassword;
      dataToSend.newPassword = userData.newPassword;
    }

    // Fazer requisição para a API
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

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Resposta de erro do servidor:", error.response.data);

        if (error.response.status === 400 || error.response.status === 401) {
          const errorMessage =
            error.response.data.message || error.response.data.error || "";
          if (
            errorMessage.toLowerCase().includes("senha") ||
            errorMessage.toLowerCase().includes("password") ||
            errorMessage.toLowerCase().includes("invalid request")
          ) {
            throw new Error("Senha atual inválida");
          }
        }

        if (error.response.status === 401) {
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        } else if (error.response.status === 403) {
          throw new Error("Você não tem permissão para atualizar este perfil.");
        } else if (error.response.status === 404) {
          throw new Error("Usuário não encontrado.");
        }

        throw new Error(
          error.response.data.message ||
            error.response.data.error ||
            "Erro ao atualizar o perfil"
        );
      } else if (error.request) {
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
    console.error("Erro ao obter lista de usuários:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      } else if (error.response?.status === 403) {
        throw new Error("Você não tem permissão para acessar esta lista.");
      } else if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao buscar lista de usuários"
        );
      } else if (error.request) {
        throw new Error(
          "Servidor não respondeu. Verifique sua conexão de internet."
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

export const createUser = async (userData: RegisterRequest) => {
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

export const deleteUserAccount = async (userId: number) => {
  try {
    if (!userId) {
      throw new Error("ID do usuário é necessário para excluir a conta");
    }

    const response = await axios.delete(`${API_URL}/v1/user/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao excluir conta:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        } else if (error.response.status === 403) {
          throw new Error("Você não tem permissão para excluir esta conta.");
        } else if (error.response.status === 404) {
          throw new Error("Usuário não encontrado.");
        }

        throw new Error(
          error.response.data.message || "Erro ao excluir a conta"
        );
      } else if (error.request) {
        throw new Error(
          "Servidor não respondeu. Verifique sua conexão de internet."
        );
      }
    }

    throw new Error("Ocorreu um erro inesperado ao excluir a conta.");
  }
};

// Interface para atualização de outros usuários pelo admin
export interface AdminUserUpdate {
  name?: string;
  email?: string;
  perfil?: string;
  active?: boolean;
}

// Função para atualizar um usuário (como admin)
export const updateUser = async (userId: number, userData: AdminUserUpdate) => {
  try {
    // Verificação do ID
    if (!userId) {
      throw new Error("ID do usuário é necessário para atualização");
    }

    // Preparar dados para envio com tipagem correta
    const dataToSend = {
      name: userData.name,
      email: userData.email,
      role: userData.perfil, // Observe que o backend pode esperar 'role' em vez de 'perfil'
      active: userData.active,
    };

    // Log para diagnóstico
    console.log(`Atualizando usuário ${userId} com dados:`, dataToSend);

    // Fazer requisição para a API com o endpoint correto
    const response = await axios.put(
      `${API_URL}/v1/user/${userId}`, // Usando o endpoint correto
      dataToSend,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    console.log("Usuário atualizado com sucesso:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Verificar se o token expirou
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      } else if (error.response?.status === 403) {
        throw new Error("Você não tem permissão para atualizar este usuário.");
      } else if (error.response?.status === 404) {
        throw new Error("Usuário não encontrado.");
      } else if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao atualizar o usuário"
        );
      }
    }

    throw new Error("Erro ao conectar com o servidor");
  }
};

export const deleteUserAdmin = async (userId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/v1/user/${userId}/admin`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      } else if (error.response?.status === 403) {
        throw new Error("Você não tem permissão para excluir este usuário.");
      } else if (error.response?.status === 404) {
        throw new Error("Usuário não encontrado.");
      } else if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao excluir o usuário"
        );
      }
    }

    throw new Error("Erro ao conectar com o servidor");
  }
};
