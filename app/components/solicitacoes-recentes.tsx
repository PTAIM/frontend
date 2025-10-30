import { format } from "date-fns";
import type { SolicitacaoData } from "~/types/solicitacao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { ArrowRight, CalendarDays, CalendarDaysIcon, Eye } from "lucide-react";
import { usePermissions } from "~/hooks/use-permissions";
import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton para a lista de Solicitações Recentes
 */
export function RecentSolicitationsSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecentSolicitations({
  data,
  isLoading,
}: {
  data: SolicitacaoData[];
  isLoading: boolean;
}) {
  const { can } = usePermissions();
  const formatData = (dateString: string) =>
    format(new Date(dateString), "dd/MM/yyyy");

  if (isLoading) return <RecentSolicitationsSkeleton />;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Solicitações Recentes</CardTitle>
          <CardDescription>
            Suas solicitações de exames mais recentes.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="../exames/solicitacoes">
            Ver Todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhuma solicitação encontrada.
          </p>
        ) : (
          data.map((sol) => (
            <div
              key={sol.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b-gray-200 border-b-1 pb-2"
            >
              {/* Lado Esquerdo */}
              <div className="">
                <p className="font-medium">{sol.nome_exame}</p>
                <p className="text-sm text-muted-foreground">
                  Solicitado por: {sol.medico_nome}
                </p>
                <span className="flex items-center mt-4 text-sm text-muted-foreground">
                  <CalendarDaysIcon className="mr-1.5 h-4 w-4" />
                  {formatData(sol.data_solicitacao)}
                </span>
              </div>
              {/* Lado Direito */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-mono text-muted-foreground">
                  {sol.codigo_solicitacao}
                </span>
                {can("read", "exames") && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`../exames/solicitacoes/${sol.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
