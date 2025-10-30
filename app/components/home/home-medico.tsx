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
import { handleApiError } from "~/lib/api-error";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { exameService } from "~/services/exames";
import type { ExameData } from "~/types/exame";
import {
  mock_laudos_por_mes,
  mock_resumo,
  mock_solicitacoes_por_mes,
  mockRecentExams,
} from "~/lib/mock";

function ChartsSection({
  solicitacoes,
  laudos,
  isLoading,
}: {
  solicitacoes?: ChartData[];
  laudos?: ChartData[];
  isLoading?: boolean;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral Mensal</CardTitle>
        <CardDescription>
          Visualize o fluxo de solicitações e laudos dos últimos meses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {/* Slide 1: Solicitações por Mês */}
            <CarouselItem>
              <div className="p-1">
                <h3 className="text-center font-medium text-sm mb-4">
                  Solicitações por Mês
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={solicitacoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mes"
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

            {/* Slide 2: Laudos por Mês */}
            <CarouselItem>
              <div className="p-1">
                <h3 className="text-center font-medium text-sm mb-4">
                  Laudos Emitidos por Mês
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={laudos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mes"
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
  solicitacoes_por_mes: mock_solicitacoes_por_mes,
  laudos_por_mes: mock_laudos_por_mes,
  exames_recentes: mockRecentExams,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [dashboardResponse, examesResponse] = await Promise.all([
        api.get<DashboardData>("/dashboard/stats", {
          params: { periodo: "all" },
        }),
        exameService.readAll({}),
      ]);
      return {
        ...dashboardResponse.data,
        exames_recentes: examesResponse.exames,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // Refaz a cada 5 minutos
  });
}

export default function MedicoDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useDashboardStats();

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
              solicitacoes={displayData?.solicitacoes_por_mes}
              laudos={displayData?.laudos_por_mes}
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
