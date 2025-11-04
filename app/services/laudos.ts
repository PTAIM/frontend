import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type { Message } from "~/types/common";
import type {
  CriarLaudo,
  AtualizarLaudo,
  LaudosParams,
  LaudoDetalhes,
  LaudosData,
} from "~/types/laudo";

class LaudoService {
  async create(data: CriarLaudo) {
    try {
      const response = await api.post<Message>("/laudos", data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async update(id: number, data: AtualizarLaudo) {
    try {
      const response = await api.put<Message>(`/laudos/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateStatus(id: number) {
    try {
      const response = await api.post<Message>(`/laudos/${id}/finalizar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async readAll(params: LaudosParams) {
    try {
      const response = await api.get<LaudosData>("/laudos", {
        params: params,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async read(id: number) {
    try {
      const response = await api.get<LaudoDetalhes>(`/laudos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const laudoService = new LaudoService();
