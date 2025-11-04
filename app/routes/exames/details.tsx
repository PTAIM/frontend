import { Link } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";

// Ícones
import {
  User,
  Stethoscope,
  ArrowLeft,
  Terminal,
  Calendar,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  FilePlus,
  Building,
  Clipboard,
} from "lucide-react";

import { cn } from "~/lib/utils";
import type { Route } from "./+types/details";
import { exameService } from "~/services/exames";
import { InfoItem, SumarioItem } from "~/components/detail-itens";
import useAuth from "~/hooks/useAuth";
import { usePermissions } from "~/hooks/use-permissions";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;

  try {
    const data = await exameService.read(Number(id));
    return { exame: data, error: null };
  } catch (error) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Não foi possível carregar os dados do exame.";
    toast.error("Erro ao buscar exame.", {
      description: errorMessage,
    });
    return { exame: null, error: "Erro Fictício" };
  }
}

// --- Componentes Auxiliares ---

// Badge de Status do Laudo
const LaudoStatusBadge = ({ temLaudo }: { temLaudo: boolean }) => {
  const config = temLaudo
    ? {
        label: "Laudado",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
      }
    : {
        label: "Aguardando Laudo",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Clock,
      };

  return (
    <Badge
      variant="outline"
      className={cn("text-sm font-semibold gap-2", config.className)}
    >
      <config.icon className="h-4 w-4" />
      {config.label}
    </Badge>
  );
};

// --- Componente Principal ---

export default function ExameDetailsPage({ loaderData }: Route.ComponentProps) {
  const { exame, error } = loaderData;
  const { can } = usePermissions();

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/exames">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Exames
          </Link>
        </Button>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Exame</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!exame) {
    return <p>Exame não encontrado.</p>;
  }

  return (
    <section>
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <Button variant="outline" asChild>
            <Link to="/exames">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Exames
            </Link>
          </Button>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-bold tracking-tight">
              {exame.nome_exame}
            </h2>
            <p className="text-muted-foreground">
              Código: {exame.codigo_solicitacao}
            </p>
          </div>
        </div>

        {/* Card: Detalhes do Exame */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <CardTitle>Informações Gerais</CardTitle>
              <LaudoStatusBadge temLaudo={exame.tem_laudo} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <InfoItem
                icon={Building}
                label="Laboratório"
                value={exame.nome_laboratorio}
              />
              <InfoItem
                icon={Calendar}
                label="Data de Realização"
                value={format(new Date(exame.data_realizacao), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              />
              <InfoItem
                icon={Calendar}
                label="Data de Upload"
                value={format(new Date(exame.data_upload), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              />
            </div>
            <Separator />
            <SumarioItem
              label="Observações do Laboratório"
              value={exame.observacoes}
            />
          </CardContent>
        </Card>

        {/* Card: Mídia Principal */}
        <Card>
          <CardHeader>
            <CardTitle>Mídia do Exame</CardTitle>
            <CardDescription>
              Arquivo principal enviado pelo laboratório.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InfoItem
              icon={FileText}
              label="Arquivo"
              value={exame.nome_arquivo}
            />
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a
                href={exame.url_arquivo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Ver / Baixar Mídia
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Envolvidos */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Vinculadas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <InfoItem
              icon={User}
              label="Paciente"
              value={
                can("read", "pacientes") ? (
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to={`/pacientes/${exame.paciente_id}`}>
                      {exame.paciente_nome} (CPF: {exame.paciente_cpf})
                    </Link>
                  </Button>
                ) : (
                  `${exame.paciente_nome}`
                )
              }
            />
            <InfoItem
              icon={Stethoscope}
              label="Médico Solicitante"
              value={`${exame.medico_nome} (${exame.medico_crm})`}
            />
            {can("read", "solicitacoes") && (
              <InfoItem
                icon={Clipboard}
                label="Solicitação Original"
                value={
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to={`/exames/solicitacoes/${exame.solicitacao_id}`}>
                      Ver Solicitação ({exame.codigo_solicitacao})
                    </Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
