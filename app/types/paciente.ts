export type CriarPaciente = {
  nome: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  sumario_saude?: {
    alergias?: string;
    medicamentos_uso?: string;
    condicoes_preexistentes?: string;
    historico_familiar?: string;
  };
};

export type AtualizarPaciente = {
  nome?: string;
  email?: string;
  telefone?: string;
  sumario_saude?: {
    alergias?: string;
    medicamentos_uso?: string;
    condicoes_preexistentes?: string;
    historico_familiar?: string;
  };
};

export type PacientesParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type PacienteData = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
};

export type PacientesData = {
  pacientes: PacienteData[];
  total: number;
  page: number;
  limit: number;
};

export type PacienteDetalhes = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
  sumario_saude: {
    alergias: string;
    medicamentos_uso: string;
    condicoes_preexistentes: string;
    historico_familiar: string;
  };
};
