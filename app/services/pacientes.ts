import { handleApiError } from "~/lib/api-error";
import { api } from "~/lib/axios";
import type { Message } from "~/types/common";
import type {
  CriarPaciente,
  AtualizarPaciente,
  PacientesParams,
  PacienteDetalhes,
  PacientesData,
} from "~/types/paciente";

class PacienteService {
  async create(data: CriarPaciente) {
    try {
      const response = await api.post<Message>("/pacientes", data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async update(id: number, data: AtualizarPaciente) {
    try {
      const response = await api.put<Message>(`/pacientes/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async readAll(params?: { search?: string; page?: number; perPage?: number }) {
    try {
      const response = await api.get<PacientesData>("/pacientes", { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async read(id: number) {
    try {
      const response = await api.get<PacienteDetalhes>(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const pacienteService = new PacienteService();
