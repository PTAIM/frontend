import type { ChartData, ResumoData } from "~/types/dashboard";
import type { ExameData } from "~/types/exame";
import type { PacientesData } from "~/types/paciente";
import type { SolicitacaoData } from "~/types/solicitacao";

export const mockSolicitacoes: SolicitacaoData[] = [
  {
    id: 1,
    codigo_solicitacao: "RM-001",
    paciente_id: 201,
    paciente_nome: "Maria Silva",
    medico_id: 1,
    medico_nome: "Dr. João Silva",
    nome_exame: "Ressonância Magnética",
    status: "RESULTADO_ENVIADO",
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
    status: "AGUARDANDO_RESULTADO",
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
    status: "CANCELADO",
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
    data_realizacao: new Date("2025-10-24T14:30:00Z").toISOString(),
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
    data_realizacao: new Date("2025-10-23T10:00:00Z").toISOString(),
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
    data_realizacao: new Date("2025-10-23T09:15:00Z").toISOString(),
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

export const mock_solicitacoes_por_mes: ChartData[] = [
  { mes: "Jul", total: 35 },
  { mes: "Ago", total: 42 },
  { mes: "Set", total: 58 },
  { mes: "Out", total: 40 },
];

export const mock_laudos_por_mes: ChartData[] = [
  { mes: "Jul", total: 30 },
  { mes: "Ago", total: 38 },
  { mes: "Set", total: 51 },
  { mes: "Out", total: 35 },
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
