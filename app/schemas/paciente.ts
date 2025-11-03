import { z } from "zod";

export const createPatientSchema = z.object({
  nome: z.string().min(3, "O nome completo é obrigatório."),
  email: z
    .string()
    .email("Por favor, insira um email válido.")
    .min(1, "O email é obrigatório."),
  telefone: z
    .string()
    .min(10, { message: "Telefone deve ter pelo menos 10 dígitos." })
    .transform((v) => v.replace(/[^\d]/g, "")),
  cpf: z
    .string()
    .min(11, { message: "CPF deve ter 11 dígitos." })
    .transform((v) => v.replace(/[^\d]/g, "")),

  data_nascimento: z.date({
    message: "A data de nascimento é obrigatória.",
  }),
  sumario_saude: z.object({
    alergias: z.string().optional(),
    medicacoes: z.string().optional(),
    historico_doencas: z.string().optional(),
  }),
});
