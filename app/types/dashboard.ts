import type { ExameData } from "./exame";

export type ResumoData = {
  total_solicitacoes: number;
  exames_recebidos: number;
  laudos_emitidos: number;
  total_pacientes: number;
};

export type ChartData = {
  data_ponto: string;
  total: number;
};

export type DashboardData = {
  resumo: ResumoData;
  solicitacoes_por_agrupamento: ChartData[];
  laudos_por_agrupamento: ChartData[];
};
