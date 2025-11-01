import { z } from "zod";

export const uploadExamSchema = z.object({
  codigo_solicitacao: z.string().min(1, 'O código do exame é obrigatório'),
  data_realizacao: z.date({ error: 'A data de realização é obrigatória' }),
  nome_laboratorio: z.string().min(1, 'O nome do laboratório é obrigatório'),
  observacoes: z.string().optional(),
  arquivo: z.instanceof(File, { message: 'O arquivo do exame é obrigatório' }),
});