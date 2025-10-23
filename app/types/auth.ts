export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  nome: string;
  cpf: string;
  tipo: UserRegisterType;
  crm?: string;
  nomeClinica?: string;
};

export type User = {
  name: string;
  email: string;
  cpf: string;
  tipo: UserRegisterType;
};

export enum UserRegisterType {
  medico = "Médico",
  funcionario = "Funcionário",
}
