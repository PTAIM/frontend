import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type { Message } from "~/types/common";
import type {
  SolicitacaoData,
  CriarSolicitacao,
  AtualizarSolicitacao,
  SolicitacoesParams,
  SolicitacoesData,
} from "~/types/solicitacao";

class SolicitacaoService {
  async create(data: CriarSolicitacao) {
    try {
      const response = await api.post<Message>("/solicitacoes", data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async update(solicitacaoId: number, data: AtualizarSolicitacao) {
    try {
      const response = await api.put<SolicitacaoData>(
        `/solicitacoes/${solicitacaoId}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async readAll(params: SolicitacoesParams) {
    try {
      const response = await api.get<SolicitacoesData>("/solicitacoes", {
        params: params,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async read(solicitacaoId: number) {
    try {
      const response = await api.get<SolicitacaoData>(
        `/solicitacoes/${solicitacaoId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async delete(solicitacaoId: number) {
    try {
      const response = await api.delete<Message>(
        `/solicitacoes/${solicitacaoId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const solicitacaoService = new SolicitacaoService();
