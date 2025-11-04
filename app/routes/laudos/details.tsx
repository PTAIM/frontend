import { Link } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  User,
  ArrowLeft,
  Terminal,
  Calendar,
  FileText,
  PackageSearch,
  Download,
} from "lucide-react";

import { cn } from "../../lib/utils";
import type { Route } from "./+types/details";
import { laudoService } from "~/services/laudos";
import type { LaudoStatus } from "~/types/laudo";
import { cpfMask } from "~/lib/utils";
import remarkGfm from "remark-gfm";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const data = await laudoService.read(Number(params.id));
    return { laudo: data, error: null };
  } catch (error) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Não foi possível carregar os dados do laudo.";
    toast.error("Erro ao buscar laudo.", {
      description: errorMessage,
    });
    return { laudo: null, error: "Erro Fictício" };
  }
}

const StatusBadge = ({ status }: { status: LaudoStatus }) => {
  const statusConfig = {
    RASCUNHO: {
      label: "Em Rascunho",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    FINALIZADO: {
      label: "Finalizado",
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };
  const config = statusConfig[status] || statusConfig.RASCUNHO;
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold", config.className)}
    >
      {config.label}
    </Badge>
  );
};

export default function LaudoDetailsPage({ loaderData }: Route.ComponentProps) {
  const { laudo, error } = loaderData;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/laudos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Laudos
          </Link>
        </Button>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Laudo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!laudo) {
    return <p>Laudo não encontrado.</p>;
  }

  return (
    <section>
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <Button variant="outline" asChild>
            <Link to="/laudos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Laudos
            </Link>
          </Button>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-bold tracking-tight">
              {laudo.titulo}
            </h2>
            <p className="text-muted-foreground">
              Emitido por: {laudo.medico_nome} ({laudo.medico_crm})
            </p>
          </div>
        </div>

        {/* Card: Informações Gerais */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <CardTitle>Informações Gerais</CardTitle>
              <StatusBadge status={laudo.status} />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paciente
                </p>
                <p className="text-base font-medium">
                  {laudo.paciente_nome} (CPF: {cpfMask(laudo.paciente_cpf)})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data de Emissão
                </p>
                <p className="text-base font-medium">
                  {format(
                    new Date(laudo.data_emissao),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR },
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Conteúdo do Laudo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Conteúdo do Laudo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Renderizador de Markdown para os Achados */}
            <div>
              <h4 className="text-sm font-medium uppercase text-muted-foreground mb-2">
                Achados
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {laudo.descricao}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Exames Associados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PackageSearch className="mr-2 h-5 w-5" />
              Exames Associados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exame</TableHead>
                    <TableHead>Laboratório</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[100px]">Mídia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laudo.exames.length > 0 ? (
                    laudo.exames.map((exame) => (
                      <TableRow key={exame.id}>
                        <TableCell className="font-medium">
                          {exame.nome_exame}
                          <p className="text-xs text-muted-foreground">
                            {exame.codigo_solicitacao}
                          </p>
                        </TableCell>
                        <TableCell>{exame.nome_laboratorio}</TableCell>
                        <TableCell>
                          {format(
                            new Date(exame.data_realizacao),
                            "dd/MM/yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={exame.url_arquivo}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Ver
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nenhum exame associado a este laudo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
