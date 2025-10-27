import type { Route } from "./+types/register";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "~/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UserRegisterType, type RegisterData } from "~/types/auth";
import { cpfMask, phoneMask } from "~/lib/utils";
import { authService } from "~/services/auth";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cadastro - MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

export default function Register() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      password: "",
      confirmPassword: "",
      tipo: undefined,
      crm: "",
      nomeClinica: "",
    },
  });

  const watchedTipo = form.watch("tipo");

  async function registerSubmit(data: z.infer<typeof registerSchema>) {
    try {
      await authService.register(data as RegisterData);
      navigate("/login", { replace: true });
      toast.success("Cadastro realizado com sucesso! Faça Login");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF] p-4">
      <div className="flex flex-col items-center w-full">
        {/* Logo e Título */}
        <div className="mb-6 flex flex-col items-center justify-center space-y-2">
          <Link to="/" className="flex items-center space-x-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="text-4xl font-bold">MediScan</span>
          </Link>
          <p className="text-muted-foreground">Crie sua conta</p>
        </div>

        {/* Card do Formulário */}
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(registerSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field: { onChange, ...props } }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(99) 99999-9999"
                          onChange={(e) => {
                            const masked = phoneMask(e.target.value);
                            onChange(masked);
                          }}
                          {...props}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field: { onChange, ...props } }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123.456.789-00"
                          onChange={(e) => {
                            const masked = cpfMask(e.target.value);
                            onChange(masked);
                          }}
                          {...props}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirmar Senha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Usuário</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de usuário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="medico">Médico</SelectItem>
                          <SelectItem value="funcionario">
                            Funcionário (Clínica)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Campos Condicionais --- */}

                {watchedTipo === UserRegisterType.medico && (
                  <FormField
                    control={form.control}
                    name="crm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRM</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedTipo === UserRegisterType.funcionario && (
                  <FormField
                    control={form.control}
                    name="nomeClinica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Clínica</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da clínica onde trabalha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full">
                  Cadastrar
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Entrar
              </Link>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link to="/" className="text-muted-foreground hover:underline">
                Voltar para página inicial
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
