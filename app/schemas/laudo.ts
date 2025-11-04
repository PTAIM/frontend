import { z } from "zod";

const step1LaudoSchema = z.object({
  exames: z
    .array(z.number())
    .min(1, "Selecione pelo menos um exame para laudar"),
  paciente_id: z.number().min(1),
});

const step2LaudoSchema = z.object({
  titulo: z.string().nonempty("Um titulo para o laudo é obrigatório"),
  descricao: z.string().nonempty("Uma descrição para o laudo é obrigatória"),
});

export const createLaudoSchema = z.object({
  step1: step1LaudoSchema,
  step2: step2LaudoSchema,
});

export const updateLaudoSchema = z.object({
  titulo: z.string().nonempty("Um título para o laudo é obrigatório"),
  descricao: z.string().nonempty("Uma descrição para o laudo é obrigatória"),
});

export type CreateLaudoForm = z.infer<typeof createLaudoSchema>;

export type UpdateLaudoForm = z.infer<typeof updateLaudoSchema>;
