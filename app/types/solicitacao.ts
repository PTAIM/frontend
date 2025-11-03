export enum SolicitacaoStatus {
  aguardando = "AGUARDANDO_RESULTADO",
  enviado = "RESULTADO_ENVIADO",
  cancelado = "CANCELADO",
}

export type CriarSolicitacao = {
  paciente_id: number;
  nome_exame: string;
  data: Date;
  hipotese_diagnostica: string;
  detalhes_preparo: string;
};

export type SolicitacoesParams = {
  status?: SolicitacaoStatus;
  paciente_id?: number;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type SolicitacaoData = {
  id: number;
  codigo_solicitacao: string;
  paciente_id: number;
  paciente_nome: string;
  medico_id: number;
  medico_nome: string;
  nome_exame: string;
  status: SolicitacaoStatus;
  data_solicitacao: string;
};

export type SolicitacoesData = {
  solicitacoes: SolicitacaoData[];
  total: number;
  page: number;
  limit: number;
};

export type AtualizarSolicitacao = {
  nome_exame?: string;
  hipotese_diagnostica?: string;
  detalhes_preparo?: string;
  status?: SolicitacaoStatus;
};
