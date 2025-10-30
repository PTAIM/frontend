import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import type { ExameData } from "~/types/exame";
import { usePermissions } from "~/hooks/use-permissions";
import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton para a lista de Exames Recentes
 */
export function RecentExamsSkeleton() {
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

export default function RecentExams({
  data,
  isLoading,
}: {
  data: ExameData[];
  isLoading?: boolean;
}) {
  const { can } = usePermissions();
  // Função helper para formatar a data
  const formatDataRealizacao = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      console.error("Data inválida:", dateString);
      return "Data inválida";
    }
  };

  if (isLoading) return <RecentExamsSkeleton />;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Exames Recentes</CardTitle>
          <CardDescription>
            Os {data.length} exames mais recentes que foram enviados.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/exames">
            Ver Todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          {data.length === 0 ? (
            <p className="text-muted-foreground">Nenhum exame encontrado.</p>
          ) : (
            data.map((exame) => (
              <div
                key={exame.id}
                className="flex items-center justify-between gap-4 border-b-gray-200 border-b-1 pb-2"
              >
                <div>
                  <p className="font-medium">{exame.paciente_nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {exame.nome_exame}
                  </p>
                  <div className="text-muted-foreground text-sm mt-4 flex flex-row items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <p className="text-sm text-muted-foreground">
                      {formatDataRealizacao(exame.data_realizacao)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end sm:flex-row sm:items-center sm:space-x-4">
                  {can("create", "laudos") && exame.tem_laudo && (
                    <div className="flex items-center space-x-1.5 text-sm font-medium text-green-600">
                      <CheckCircle2 size={16} />
                      <span>Laudado</span>
                    </div>
                  )}{" "}
                  {can("read", "exames") && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`../exames/${exame.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {can("delete", "exames") && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        console.log("deletando exame...");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
