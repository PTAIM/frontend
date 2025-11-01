import { z } from "zod";

export const uploadExamSchema = z.object({
  codigo_solicitacao: z.string().min(1, 'Código do exame é obrigatório'),
  data_realizacao: z.date({ error: 'Data de realização é obrigatória' }),
  nome_laboratorio: z.string().min(1, 'Nome do laboratório é obrigatório'),
  observacoes: z.string().optional(),
  arquivos: z.array(z.instanceof(File)).min(1, 'Pelo menos um arquivo é obrigatório'),
});