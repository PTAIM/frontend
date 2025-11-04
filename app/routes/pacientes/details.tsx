import { Link } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import {
  User,
  Cake,
  Mail,
  Phone,
  FileText,
  ArrowLeft,
  Terminal,
  HeartPulse,
} from "lucide-react";

import type { Route } from "./+types/details";
import { pacienteService } from "~/services/pacientes";
import { toast } from "sonner";

import { cpfMask, phoneMask } from "~/lib/utils";
import { InfoItem, SumarioItem } from "~/components/detail-itens";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const data = await pacienteService.read(Number(params.id));
    return { paciente: data, error: null };
  } catch (error) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Não foi possível carregar os dados do paciente.";
    toast.error("Erro ao buscar paciente.", {
      description: errorMessage,
    });
    return { paciente: null, error: errorMessage };
  }
}

export default function PacienteDetailsPage({
  loaderData,
}: Route.ComponentProps) {
  const { paciente, error } = loaderData;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/pacientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Pacientes
          </Link>
        </Button>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Paciente</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!paciente) {
    return <p>Paciente não encontrado.</p>; // Ou um componente 404
  }

  // Helper para fallback do avatar
  const avatarFallback = paciente.nome
    ? paciente.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "P";

  return (
    <section>
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="outline" asChild>
            <Link to="/pacientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Pacientes
            </Link>
          </Button>

          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={paciente.avatar} alt={paciente.nome} />
              <AvatarFallback className="text-2xl">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {paciente.nome}
              </h2>
              <p className="text-muted-foreground">Perfil do Paciente</p>
            </div>
          </div>
        </div>

        {/* Card: Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <InfoItem
              icon={FileText}
              label="CPF"
              value={cpfMask(paciente.cpf)}
            />
            <InfoItem
              icon={Cake}
              label="Data de Nascimento"
              value={format(new Date(paciente.data_nascimento), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            />
            <InfoItem icon={Mail} label="Email" value={paciente.email} />
            <InfoItem
              icon={Phone}
              label="Telefone"
              value={phoneMask(paciente.telefone)}
            />
          </CardContent>
        </Card>

        {/* Card: Sumário de Saúde */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HeartPulse className="mr-2 h-5 w-5" />
              Sumário de Saúde
            </CardTitle>
            <CardDescription>
              Resumo do histórico médico do paciente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SumarioItem
              label="Alergias"
              value={paciente.sumario_saude.alergias}
            />
            <Separator />
            <SumarioItem
              label="Medicações Contínuas"
              value={paciente.sumario_saude.medicacoes}
            />
            <Separator />
            <SumarioItem
              label="Histórico de Doenças Relevantes"
              value={paciente.sumario_saude.historico_doencas}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
