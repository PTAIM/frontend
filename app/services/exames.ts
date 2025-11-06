import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type { Message } from "~/types/common";
import type {
  ExameData,
  CriarExame,
  ExamesParams,
  ExamesData,
  ExameDetalhes,
  ExamesDetalhes,
  LerExames,
} from "~/types/exame";

class ExameService {
  async create(data: CriarExame) {
    const formData = new FormData();

    formData.append("codigo_solicitacao", data.codigo_solicitacao);
    formData.append("data_realizacao", data.data_realizacao.toISOString());
    formData.append("nome_laboratorio", data.nome_laboratorio);
    formData.append("arquivo", data.arquivo);
    if (data.observacoes) {
      formData.append("observacoes", data.observacoes);
    }

    try {
      const response = await api.post<Message>("/resultados", formData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async readAll(params: ExamesParams) {
    try {
      const response = await api.get<ExamesData>("/exames", {
        params: params,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async readByIds(data: LerExames) {
    try {
      const response = await api.post<ExamesDetalhes[]>(
        "/exames/detalhes",
        data,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async read(exameId: number) {
    try {
      const response = await api.get<ExameDetalhes>(`/exames/${exameId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async delete(exameId: number) {
    try {
      const response = await api.delete<Message>(`/exames/${exameId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const exameService = new ExameService();
