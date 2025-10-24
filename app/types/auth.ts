export enum UserRegisterType {
  medico = "medico",
  funcionario = "funcionario",
}

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type CurrentUser = {
  id: number;
  nome: string;
  email: string;
  tipo: UserRegisterType;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  usuario: CurrentUser;
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
