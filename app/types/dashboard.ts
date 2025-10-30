import type { ExameData } from "./exame";

export type ResumoData = {
  total_solicitacoes: number;
  exames_recebidos: number;
  laudos_emitidos: number;
  total_pacientes: number;
};

export type ChartData = {
  mes: string;
  total: number;
};

export type DashboardData = {
  resumo: ResumoData;
  solicitacoes_por_mes: ChartData[];
  laudos_por_mes: ChartData[];
};
