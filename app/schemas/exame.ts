import { z } from "zod";

export const uploadExamSchema = z.object({
  codigo_solicitacao: z.string().min(1, "O código do exame é obrigatório"),
  data_realizacao: z.date({ error: "A data de realização é obrigatória" }),
  nome_laboratorio: z.string().min(1, "O nome do laboratório é obrigatório"),
  observacoes: z.string().optional(),
  arquivo: z.instanceof(File, { message: "O arquivo do exame é obrigatório" }),
});

export const solicitacaoSchema = z.object({
  paciente_id: z.number().min(1),
  nome_exame: z.string().min(1, "Nome do exame é obrigatório"),
  data: z.date(),
  hipotese_diagnostica: z.string().min(1, "Hipótese diagnóstica é obrigatória"),
  detalhes_preparo: z.string().optional(),
});
