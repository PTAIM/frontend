// src/services/authService.ts
import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type { LoginCredentials, RegisterData, User } from "~/types/auth";

class AuthService {
  async login(credentials: LoginCredentials) {
    try {
      await api.post<void>("/auth/login", credentials);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async register(data: RegisterData) {
    try {
      await api.post<void>("/auth/register", data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMe() {
    try {
      const response = await api.get<User>("/auth/me");
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
