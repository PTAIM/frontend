import type { ChartData, ResumoData } from "~/types/dashboard";
import type { ExameData } from "~/types/exame";
import type { PacientesData } from "~/types/paciente";
import { SolicitacaoStatus, type SolicitacaoData } from "~/types/solicitacao";

export const mockSolicitacoes: SolicitacaoData[] = [
  {
    id: 1,
    codigo_solicitacao: "RM-001",
    paciente_id: 201,
    paciente_nome: "Maria Silva",
    medico_id: 1,
    medico_nome: "Dr. João Silva",
    nome_exame: "Ressonância Magnética",
    paciente_cpf: "123.456.789-00",
    medico_crm: "123456/SP",
    hipotese_diagnostica: "Nenhuma",
    detalhes_preparo: "Jejum de 8h",
    status: SolicitacaoStatus.aguardando,
    data_solicitacao: new Date("2025-10-24T10:00:00Z").toISOString(),
  },
  {
    id: 2,
    codigo_solicitacao: "TC-002",
    paciente_id: 201,
    paciente_nome: "Maria Silva",
    medico_id: 2,
    medico_nome: "Dra. Ana Costa",
    nome_exame: "Tomografia",
    paciente_cpf: "123.456.789-00",
    medico_crm: "123456/SP",
    hipotese_diagnostica: "Nenhuma",
    detalhes_preparo: "Jejum de 8h",
    status: SolicitacaoStatus.aguardando,
    data_solicitacao: new Date("2025-10-22T09:00:00Z").toISOString(),
  },
  {
    id: 3,
    codigo_solicitacao: "RX-003",
    paciente_id: 201,
    paciente_nome: "Maria Silva",
    medico_id: 1,
    medico_nome: "Dr. João Silva",
    nome_exame: "Raio-X",
    paciente_cpf: "123.456.789-00",
    medico_crm: "123456/SP",
    hipotese_diagnostica: "Nenhuma",
    detalhes_preparo: "Jejum de 8h",
    status: SolicitacaoStatus.cancelado,
    data_solicitacao: new Date("2025-10-20T15:00:00Z").toISOString(),
  },
];

export const mockRecentExams: ExameData[] = [
  {
    id: 1,
    solicitacao_id: 101,
    codigo_solicitacao: "RM-001",
    paciente_id: 201,
    paciente_nome: "Maria Silva",
    nome_exame: "Ressonância Magnética",
    data_realizacao: new Date("2025-11-04T14:30:00Z").toISOString(),
    nome_laboratorio: "Clínica Imagem",
    tem_laudo: true,
  },
  {
    id: 2,
    solicitacao_id: 102,
    codigo_solicitacao: "TC-002",
    paciente_id: 202,
    paciente_nome: "João Santos",
    nome_exame: "Tomografia",
    data_realizacao: new Date("2025-11-03T10:00:00Z").toISOString(),
    nome_laboratorio: "Clínica Imagem",
    tem_laudo: false,
  },
  {
    id: 3,
    solicitacao_id: 103,
    codigo_solicitacao: "RX-003",
    paciente_id: 203,
    paciente_nome: "Ana Costa",
    nome_exame: "Raio-X",
    data_realizacao: new Date("2025-11-03T09:15:00Z").toISOString(),
    nome_laboratorio: "Clínica Imagem",
    tem_laudo: true,
  },
];

export const mock_resumo: ResumoData = {
  total_solicitacoes: 142,
  exames_recebidos: 105,
  laudos_emitidos: 98,
  total_pacientes: 67,
};

export const mock_solicitacoes_agrupadas: ChartData[] = [
  { data_ponto: "2024-12", total: 50 },
  { data_ponto: "2025-01", total: 40 },
  { data_ponto: "2025-02", total: 18 },
  { data_ponto: "2025-03", total: 22 },
  { data_ponto: "2025-04", total: 29 },
  { data_ponto: "2025-05", total: 26 },
  { data_ponto: "2025-06", total: 34 },
  { data_ponto: "2025-07", total: 21 },
  { data_ponto: "2025-08", total: 46 },
  { data_ponto: "2025-09", total: 34 },
  { data_ponto: "2025-10", total: 38 },
  { data_ponto: "2025-11", total: 28 },
];

export const mock_laudos_agrupados: ChartData[] = [
  { data_ponto: "2024-12", total: 14 },
  { data_ponto: "2025-01", total: 18 },
  { data_ponto: "2025-02", total: 37 },
  { data_ponto: "2025-03", total: 9 },
  { data_ponto: "2025-04", total: 31 },
  { data_ponto: "2025-05", total: 40 },
  { data_ponto: "2025-06", total: 20 },
  { data_ponto: "2025-07", total: 40 },
  { data_ponto: "2025-08", total: 46 },
  { data_ponto: "2025-09", total: 45 },
  { data_ponto: "2025-10", total: 20 },
  { data_ponto: "2025-11", total: 50 },
];

export const mockPacientesData: PacientesData = {
  pacientes: [
    {
      id: 1,
      nome: "Ana Beatriz Silva",
      email: "ana.silva@example.com",
      cpf: "111.222.333-44",
      data_nascimento: "1990-05-15",
      telefone: "(11) 91234-5678",
    },
    {
      id: 2,
      nome: "Bruno Costa",
      email: "bruno.costa@email.com",
      cpf: "222.333.444-55",
      data_nascimento: "1985-11-20",
      telefone: "(21) 98765-4321",
    },
    {
      id: 3,
      nome: "Carla Dias",
      email: "carla.d@provider.net",
      cpf: "333.444.555-66",
      data_nascimento: "2001-02-10",
      telefone: "(31) 99887-7665",
    },
    {
      id: 4,
      nome: "Daniel Moreira",
      email: "daniel.m@example.com",
      cpf: "444.555.666-77",
      data_nascimento: "1995-09-30",
      telefone: "(41) 98877-6655",
    },
  ],

  total: 28,
  page: 1,
  limit: 4,
};
