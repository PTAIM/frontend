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
import { ClipboardList, FileCheck, PackageSearch } from "lucide-react";
import RecentSolicitations from "../solicitacoes-recentes";
import { useQuery } from "@tanstack/react-query";
import { solicitacaoService } from "~/services/solicitacoes";
import { useEffect } from "react";
import { toast } from "sonner";
import { mockSolicitacoes } from "~/lib/mock";

function QuickActionsPaciente() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Ações Principais</CardTitle>
        <CardDescription>
          Acesse seus exames e laudos com facilidade.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="../exames/solicitacoes">
            <ClipboardList className="mr-2 h-4 w-4" />
            Ver Minhas Solicitações
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="../exames">
            <PackageSearch className="mr-2 h-4 w-4" />
            Ver Meus Exames
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="../laudos">
            <FileCheck className="mr-2 h-4 w-4" />
            Ver Meus Laudos
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function useSolicitacoesRecentes() {
  return useQuery({
    queryKey: ["solicitacoes-recentes"],
    queryFn: async () => {
      const data = await solicitacaoService.readAll({ page: 1, limit: 3 });
      return data.solicitacoes;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // Refaz a cada 5 minutos
  });
}

export default function PacienteHomePage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useSolicitacoesRecentes();

  useEffect(() => {
    if (isError && error) {
      toast.error("Erro ao carregar dados do dashboard.", {
        description:
          (error as any)?.response?.data?.message ||
          error.message ||
          "Tente novamente mais tarde.",
      });
    }
  }, [isError, error]);

  const displayData = isError ? mockSolicitacoes : data;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Título */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Portal do Paciente
        </h2>
        <p className="text-muted-foreground">
          Olá, <strong>{user?.nome}</strong> 👋. Bem-vindo(a) ao seu portal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <QuickActionsPaciente />
        <RecentSolicitations data={displayData ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
