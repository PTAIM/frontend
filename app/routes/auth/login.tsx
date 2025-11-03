import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "~/schemas/auth";
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
import useAuth from "~/hooks/useAuth";
import type { LoginCredentials } from "~/types/auth";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function loginSubmit(data: z.infer<typeof loginSchema>) {
    try {
      await login(data as LoginCredentials);
      navigate("/home", { replace: true });
      toast.success("Login efetuado com sucesso");
    } catch (error) {
      toast.error("Falha no login. Email ou senha incorretos!");
    }
  }

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF] p-4">
      <div className="flex flex-col items-center w-full">
        {/* Logo e Título */}
        <div className="mb-6 flex flex-col items-center justify-center space-y-2">
          <Link to="/" className="flex items-center space-x-2">
            <img src="name_logo2.png" className="w-72 h-10 object-cover" />
          </Link>
          <p className="text-muted-foreground">Entre na sua conta</p>
        </div>

        {/* Card do Formulário */}
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(loginSubmit)}
                className="space-y-10"
              >
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
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

                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="font-medium text-primary hover:underline"
              >
                Cadastre-se
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
