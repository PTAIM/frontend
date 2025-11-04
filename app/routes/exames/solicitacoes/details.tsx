import { Link } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";

import {
  User,
  Stethoscope,
  ArrowLeft,
  Terminal,
  Calendar,
  ClipboardList,
  Info,
  Hash,
} from "lucide-react";

import { cn } from "~/lib/utils";
import type { Route } from "./+types/details";
import { solicitacaoService } from "~/services/solicitacoes";
import type { SolicitacaoStatus } from "~/types/solicitacao";
import { InfoItem, SumarioItem } from "~/components/detail-itens";

import { cpfMask } from "~/lib/utils";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const data = await solicitacaoService.read(Number(params.id));
    return { solicitacao: data, error: null };
  } catch (error) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Não foi possível carregar os dados da solicitação.";
    toast.error("Erro ao buscar solicitação.", {
      description: errorMessage,
    });
    return { solicitacao: null, error: errorMessage };
  }
}

// Badge de Status
const StatusBadge = ({ status }: { status: SolicitacaoStatus }) => {
  const statusConfig = {
    AGUARDANDO_RESULTADO: {
      label: "Aguardando Resultado",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    RESULTADO_ENVIADO: {
      label: "Resultado Enviado",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    CANCELADO: {
      label: "Cancelado",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status] || statusConfig.AGUARDANDO_RESULTADO;

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold", config.className)}
    >
      {config.label}
    </Badge>
  );
};

export default function SolicitacaoDetailsPage({
  loaderData,
}: Route.ComponentProps) {
  const { solicitacao, error } = loaderData;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/exames/solicitacoes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Solicitações
          </Link>
        </Button>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Solicitação</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!solicitacao) {
    return <p>Solicitação não encontrada.</p>;
  }

  return (
    <section>
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <Button variant="outline" asChild>
            <Link to="/exames/solicitacoes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Solicitações
            </Link>
          </Button>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-bold tracking-tight">
              Detalhes da Solicitação
            </h2>
            <p className="text-muted-foreground">
              Visualize as informações da solicitação.
            </p>
          </div>
        </div>

        {/* Card: Resumo da Solicitação */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <CardTitle>Resumo</CardTitle>
              <StatusBadge status={solicitacao.status} />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <InfoItem
              icon={Hash}
              label="Código"
              value={solicitacao.codigo_solicitacao}
            />
            <InfoItem
              icon={ClipboardList}
              label="Nome do Exame"
              value={solicitacao.nome_exame}
            />
            <InfoItem
              icon={Calendar}
              label="Data da Solicitação"
              value={format(
                new Date(solicitacao.data_solicitacao),
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR },
              )}
            />
          </CardContent>
        </Card>

        {/* Card: Envolvidos (Paciente e Médico) */}
        <Card>
          <CardHeader>
            <CardTitle>Envolvidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Paciente */}
            <div className="space-y-4">
              <InfoItem
                icon={User}
                label="Paciente"
                value={solicitacao.paciente_nome}
              />
              <InfoItem
                icon={Info}
                label="CPF do Paciente"
                value={cpfMask(solicitacao.paciente_cpf)}
              />
            </div>
            <Separator />
            {/* Médico */}
            <div className="space-y-4">
              <InfoItem
                icon={Stethoscope}
                label="Médico Solicitante"
                value={solicitacao.medico_nome}
              />
              <InfoItem
                icon={Info}
                label="CRM do Médico"
                value={solicitacao.medico_crm}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card: Informações Clínicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Clínicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SumarioItem
              label="Hipótese Diagnóstica"
              value={solicitacao.hipotese_diagnostica}
            />
            <Separator />
            <SumarioItem
              label="Detalhes de Preparo"
              value={solicitacao.detalhes_preparo}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
