export type CriarExame = {
  codigo_solicitacao: string;
  data_realizacao: Date;
  nome_laboratorio: string;
  observacoes?: string;
  arquivo: File;
};

export type ExamesParams = {
  solicitacao_id?: number;
  paciente_id?: number;
  search?: string;
  medico_id?: number;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
};

export type LerExames = {
  exame_ids: number[];
};

export type ExameData = {
  id: number;
  solicitacao_id: number;
  codigo_solicitacao: string;
  paciente_id: number;
  paciente_nome: string;
  nome_exame: string;
  data_realizacao: string;
  nome_laboratorio: string;
  tem_laudo?: boolean;
};

export type ExamesData = {
  items: ExameData[];
  total: number;
  page: number;
  limit: number;
};

export type ExameDetalhes = {
  id: number;
  solicitacao_id: number;
  codigo_solicitacao: string;
  paciente_id: number;
  paciente_nome: string;
  paciente_cpf: string;
  medico_id: number;
  medico_nome: string;
  medico_crm: string;
  nome_exame: string;
  data_realizacao: string; // ISO string
  data_upload: string; // ISO string
  nome_laboratorio: string;
  nome_arquivo: string;
  url_arquivo: string;
  observacoes: string;
  tem_laudo: boolean;
};

export type ExamesDetalhes = {
  id: number;
  data_realizacao: string; // ISO string
  data_upload: string; // ISO string
  nome_laboratorio: string;
  nome_arquivo: string;
  url_arquivo: string;
  observacoes: string;
};
