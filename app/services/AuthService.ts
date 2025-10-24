// src/services/authService.ts
import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type {
  LoginCredentials,
  RegisterData,
  CurrentUser,
  LoginResponse,
} from "~/types/auth";

class AuthService {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: credentials.identifier,
        senha: credentials.password,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async register(data: RegisterData) {
    try {
      await api.post<void>("/auth/cadastro", {
        ...data,
        senha: data.password,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMe() {
    try {
      const response = await api.get<CurrentUser>("/auth/me");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout() {
    await api.post("/auth/logout", {});
  }
}

export const authService = new AuthService();
