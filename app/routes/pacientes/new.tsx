import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardFooter } from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Calendar } from "../../components/ui/calendar";
import { Separator } from "../../components/ui/separator";

import { User, HeartPulse, CalendarIcon } from "lucide-react";

import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, cpfMask, phoneMask } from "~/lib/utils";
import { createPatientSchema } from "~/schemas/paciente";
import { pacienteService } from "~/services/pacientes";
import type { CriarPaciente } from "~/types/paciente";
import { toast } from "sonner";

type CreatePatientForm = z.infer<typeof createPatientSchema>;

export default function CriarPacientePage() {
  const navigate = useNavigate();
  const form = useForm<CreatePatientForm>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      sumario_saude: {
        alergias: "",
        medicacoes: "",
        historico_doencas: "",
      },
    },
  });

  async function onSubmit(data: CreatePatientForm) {
    const pacienteData = {
      ...data,
      data_nascimento: format(data.data_nascimento, "yyyy-MM-dd"),
    };
    console.log("Dados do formulário:", pacienteData);

    try {
      await pacienteService.create(pacienteData as CriarPaciente);
      navigate("/home", { replace: true });
      toast.success("Paciente criado com sucesso!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <section>
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Cabeçalho */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Cadastrar Novo Paciente
          </h2>
          <p className="text-muted-foreground">
            Preencha os dados do paciente para criar um novo cadastro.
          </p>
        </div>

        {/* Formulário Principal */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="pt-6">
                {/* Seção 1: Informações Pessoais */}
                <div className="space-y-6">
                  <h3 className="flex items-center text-lg font-semibold">
                    <User className="mr-2 h-5 w-5" />
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome Completo */}
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome completo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Telefone */}
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
                    {/* CPF */}
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
                    {/* Data de Nascimento */}
                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                          <FormLabel>Data de Nascimento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                locale={ptBR}
                                captionLayout="dropdown"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Seção 2: Sumário de Saúde */}
                <div className="space-y-6">
                  <h3 className="flex items-center text-lg font-semibold">
                    <HeartPulse className="mr-2 h-5 w-5" />
                    Sumário de Saúde (Opcional)
                  </h3>
                  {/* Alergias */}
                  <FormField
                    control={form.control}
                    name="sumario_saude.alergias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alergias</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Penicilina, Frutos do Mar..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Medicações Contínuas */}
                  <FormField
                    control={form.control}
                    name="sumario_saude.medicacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicações Contínuas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Losartana 50mg, Metformina 850mg..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Histórico de Doenças */}
                  <FormField
                    control={form.control}
                    name="sumario_saude.historico_doencas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Histórico de Doenças Relevantes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Hipertensão, Diabetes Tipo 2..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link to="/home">Cancelar</Link>
                </Button>
                <Button type="submit">Cadastrar Paciente</Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </section>
  );
}
