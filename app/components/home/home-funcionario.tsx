import useAuth from "~/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { PackageSearch, UploadCloud } from "lucide-react";
import { Separator } from "../ui/separator";
import type { ExameData } from "~/types/exame";
import RecentExams from "../exames-recentes";
import { useQuery } from "@tanstack/react-query";
import { exameService } from "~/services/exames";
import { useEffect } from "react";
import { toast } from "sonner";
import { mockRecentExams } from "~/lib/mock";

function QuickActionsFuncionario() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Ações Principais</CardTitle>
        <CardDescription>
          Envie resultados de exames para as solicitações pendentes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3">
        <Button className="w-full justify-start" asChild>
          <Link to="../exames/upload">
            <UploadCloud className="mr-2 h-4 w-4" />
            Enviar Resultado de Exame
          </Link>
        </Button>
        <Separator />
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="../exames">
            <PackageSearch className="mr-2 h-4 w-4" />
            Ver Exames Enviados
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function useExamesRecentes() {
  return useQuery({
    queryKey: ["exames-recentes"],
    queryFn: async () => {
      const data = await exameService.readAll({ page: 1, limit: 3 });
      return data.items;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // Refaz a cada 5 minutos
  });
}

export default function FuncionarioHomePage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useExamesRecentes();

  useEffect(() => {
    if (isError && error) {
      toast.error("Erro ao carregar dados dos exames.", {
        description:
          (error as any)?.response?.data?.message ||
          error.message ||
          "Tente novamente mais tarde.",
      });
    }
  }, [isError, error]);

  const displayData = isError ? mockRecentExams : data;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Título */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Portal da Clínica</h2>
        <p className="text-muted-foreground">
          Olá, <strong>{user?.nome}</strong> 👋. Gerencie os exames da sua
          clínica.
        </p>
      </div>

      {/* Card de Ações */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <QuickActionsFuncionario />
        <RecentExams data={displayData ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
