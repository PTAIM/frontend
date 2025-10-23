import { z } from "zod";
import { UserRegisterType } from "~/types/auth";

const passwordField = z
  .string()
  .nonempty("A senha é obrigatória")
  .min(6, "A senha deve ter pelo menos 6 caracteres")
  .refine(
    (v) => {
      const hasUpperCase = /[A-Z]/.test(v);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
      const hasNumber = /\d/.test(v);

      return hasUpperCase && hasSpecialChar && hasNumber;
    },
    {
      message:
        "A senha deve conter: \n" +
        "- Pelo menos 1 letra maíuscula" +
        "- Pelo menos 1 caractere especial" +
        "- Pelo menos 1 número",
    },
  );

export const loginSchema = z.object({
  identifier: z.string().nonempty("O campo é obrigatório"),
  password: z
    .string()
    .nonempty("A senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    nome: z.string().min(1, { message: "Nome completo é obrigatório." }),
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    telefone: z
      .string()
      .min(10, { message: "Telefone deve ter pelo menos 10 dígitos." }),
    cpf: z.string().min(11, { message: "CPF deve ter 11 dígitos." }),
    password: z
      .string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z.string(),
    tipo: z.nativeEnum(UserRegisterType, {
      message: "Por favor, selecione um tipo de usuário.",
    }),
    crm: z.string().optional(),
    nomeClinica: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validação de confirmação de senha
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
      });
    }

    // Validação condicional para Médico
    if (
      data.tipo === UserRegisterType.medico &&
      (!data.crm || data.crm.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "CRM é obrigatório para médicos.",
        path: ["crm"],
      });
    }

    // Validação condicional para Funcionário
    if (
      data.tipo === UserRegisterType.funcionario &&
      (!data.nomeClinica || data.nomeClinica.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Nome da clínica é obrigatório para funcionários.",
        path: ["nomeClinica"],
      });
    }
  });
