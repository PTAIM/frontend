export enum LaudoStatus {
  rascunho = "RASCUNHO",
  finalizado = "FINALIZADO",
}

export type CriarLaudo = {
  paciente_id: number;
  titulo: string;
  descricao: string;
  exames_ids: number[];
};

export type AtualizarLaudo = {
  titulo?: string;
  descricao?: string;
  status?: LaudoStatus;
};

export type LaudosParams = {
  paciente_id?: number;
  medico_id?: number;
  status?: LaudoStatus;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type LaudoData = {
  id: number;
  paciente_id: number;
  paciente_nome: string;
  medico_id: number;
  medico_nome: string;
  titulo: string;
  status: LaudoStatus;
  data_emissao: string;
  total_exames: number;
};

export type LaudosData = {
  laudos: LaudoData[];
  total: number;
  page: number;
  limit: number;
};

export type LaudoDetalhes = {
  id: number;
  paciente_id: number;
  paciente_nome: string;
  paciente_cpf: string;
  medico_id: number;
  medico_nome: string;
  medico_crm: string;
  titulo: string;
  descricao: string;
  status: LaudoStatus;
  data_emissao: string;
  exames: Array<{
    id: number;
    solicitacao_id: number;
    codigo_solicitacao: string;
    nome_exame: string;
    data_realizacao: string;
    nome_laboratorio: string;
    nome_arquivo: string;
    url_arquivo: string;
  }>;
};
