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
  medico_id?: number;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
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
  exames: ExameData[];
  total: number;
  page: number;
  limit: number;
};
