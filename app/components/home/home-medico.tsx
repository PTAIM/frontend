// Componentes Shadcn/UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { PlusCircle, List } from "lucide-react";

import useAuth from "~/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import type { ChartData, DashboardData } from "~/types/dashboard";
import StatsSection, { StatsSectionSkeleton } from "~/components/stats";
import RecentExams, { RecentExamsSkeleton } from "~/components/exames-recentes";
import { useEffect, useState } from "react";
import { api } from "~/lib/axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { exameService } from "~/services/exames";
import type { ExameData } from "~/types/exame";
import {
  mock_laudos_agrupados,
  mock_resumo,
  mock_solicitacoes_agrupadas,
  mockRecentExams,
} from "~/lib/mock";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const periodoLabels: Record<string, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  "1y": "Último Ano",
  all: "Todo o Período",
};

const agrupamentoLabels: Record<string, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
};

function ChartsSection({
  solicitacoes,
  laudos,
  isLoading,
  periodo,
  setPeriodo,
  agrupamento,
  setAgrupamento,
}: {
  solicitacoes?: ChartData[];
  laudos?: ChartData[];
  isLoading?: boolean;
  periodo: string;
  setPeriodo: (p: string) => void;
  agrupamento: string;
  setAgrupamento: (a: string) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const descAgrupamento =
    agrupamentoLabels[agrupamento]?.toLowerCase() || "período";
  const descPeriodo = periodoLabels[periodo]?.toLowerCase() || "todo o período";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral da Atividade</CardTitle>
        <CardDescription>
          Exibindo fluxo de solicitações e laudos por {descAgrupamento}, de{" "}
          {descPeriodo}.
        </CardDescription>

        <div className="flex flex-col justify-between sm:flex-row gap-4 pt-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Período
            </p>
            <ToggleGroup
              type="single"
              value={periodo}
              onValueChange={(value) => {
                if (value) setPeriodo(value);
              }}
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="7d">7D</ToggleGroupItem>
              <ToggleGroupItem value="30d">30D</ToggleGroupItem>
              <ToggleGroupItem value="90d">90D</ToggleGroupItem>
              <ToggleGroupItem value="1y">1A</ToggleGroupItem>
              <ToggleGroupItem value="all">Tudo</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Agrupar por
            </p>
            <ToggleGroup
              type="single"
              value={agrupamento}
              onValueChange={(value) => {
                if (value) setAgrupamento(value);
              }}
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="dia">Dia</ToggleGroupItem>
              <ToggleGroupItem value="semana">Semana</ToggleGroupItem>
              <ToggleGroupItem value="mes">Mês</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {/* Slide 1: Solicitações */}
            <CarouselItem>
              <div className="p-1">
                <h3 className="text-center font-medium text-sm mb-4">
                  Solicitações por {agrupamentoLabels[agrupamento] || "Período"}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={solicitacoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="data_ponto" // ATUALIZADO
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-chart-4"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CarouselItem>

            {/* Slide 2: Laudos */}
            <CarouselItem>
              <div className="p-1">
                <h3 className="text-center font-medium text-sm mb-4">
                  Laudos Emitidos por{" "}
                  {agrupamentoLabels[agrupamento] || "Período"}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={laudos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="data_ponto" // ATUALIZADO
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-chart-3"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
        </Carousel>
      </CardContent>
    </Card>
  );
}

/**
 * Ações principais (Barra Lateral)
 */
function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Principais</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        {/* Grupo Criar */}
        <Button asChild size="lg">
          <Link to="/pacientes/criar">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Paciente
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link to="/exames/solicitacoes/criar">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Solicitação
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link to="/laudos/criar">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Laudo
          </Link>
        </Button>

        <Separator className="my-4" />

        {/* Grupo Ver Todos */}
        <Button variant="outline" asChild>
          <Link to="/pacientes">
            <List className="mr-2 h-4 w-4" /> Ver Todos os Pacientes
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/exames/solicitacoes">
            <List className="mr-2 h-4 w-4" /> Ver Todas as Solicitações
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/laudos">
            <List className="mr-2 h-4 w-4" /> Ver Todos os Laudos
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export type MedicoDashboardData = DashboardData & {
  exames_recentes: ExameData[];
};

const defaultEmptyData: MedicoDashboardData = {
  resumo: mock_resumo,
  solicitacoes_por_agrupamento: mock_solicitacoes_agrupadas,
  laudos_por_agrupamento: mock_laudos_agrupados,
  exames_recentes: mockRecentExams,
};

export function useDashboardStats({
  periodo,
  agrupamento,
}: {
  periodo: string;
  agrupamento: string;
}) {
  return useQuery({
    queryKey: ["dashboard-stats", periodo, agrupamento],
    queryFn: async () => {
      const [dashboardResponse, examesResponse] = await Promise.all([
        api.get<DashboardData>("/dashboard/stats", {
          params: { periodo, agrupamento },
        }),
        exameService.readAll({}),
      ]);
      return {
        ...dashboardResponse.data,
        exames_recentes: examesResponse.exames,
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

export default function MedicoDashboard() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState("30d");
  const [agrupamento, setAgrupamento] = useState("mes");

  // ATUALIZADO: Passando filtros para o hook
  const { data, isLoading, isError, error } = useDashboardStats({
    periodo,
    agrupamento,
  });

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

  const displayData = isError ? defaultEmptyData : data;

  return (
    <div>
      <div className="container mx-auto py-8 space-y-8">
        {/* Cabeçalho da Página */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bem-vindo(a), {user?.nome?.split(" ")[0] || "Doutor(a)"}
          </h2>
          <p className="text-muted-foreground">
            Aqui está um resumo da sua atividade na plataforma.
          </p>
        </div>

        {/* Seção de Estatísticas */}

        <StatsSection data={displayData?.resumo} isLoading={isLoading} />

        {/* Layout Principal (Gráficos + Ações) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda (Gráficos e Exames) */}
          <div className="lg:col-span-2 space-y-8">
            <ChartsSection
              isLoading={isLoading}
              solicitacoes={displayData?.solicitacoes_por_agrupamento}
              laudos={displayData?.laudos_por_agrupamento}
              periodo={periodo}
              setPeriodo={setPeriodo}
              agrupamento={agrupamento}
              setAgrupamento={setAgrupamento}
            />
            <RecentExams
              data={displayData?.exames_recentes ?? []}
              isLoading={isLoading}
            />
          </div>

          {/* Coluna Direita (Ações) - Não depende de dados */}
          <div className="lg:col-span-1 space-y-8">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
