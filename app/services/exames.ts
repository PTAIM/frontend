import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type { Message } from "~/types/common";
import type {
  ExameData,
  CriarExame,
  ExamesParams,
  ExamesData,
} from "~/types/exame";

class ExameService {
  async create(data: CriarExame) {
    try {
      const response = await api.post<Message>("/exames/resultados", data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async readAll(params: ExamesParams) {
    try {
      const response = await api.get<ExamesData>("/exames/resultados", {
        params: params,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async read(exameId: number) {
    try {
      const response = await api.get<ExameData>(
        `/exames/resultados/${exameId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async delete(exameId: number) {
    try {
      const response = await api.delete<Message>(
        `/exames/resultados/${exameId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const exameService = new ExameService();
