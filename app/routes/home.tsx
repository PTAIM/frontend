import { usePermissions } from "~/hooks/use-permissions";
import type { Route } from "./+types/home";

import type { ChartData, DashboardData, ResumoData } from "~/types/dashboard";
import MedicoDashboard from "~/components/home/home-medico";
import PacienteHomePage from "~/components/home/home-paciente";
import FuncionarioHomePage from "~/components/home/home-funcionario";
import type { ExameData } from "~/types/exame";
import useAuth from "~/hooks/useAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

export async function clientLoader(params: Route.ClientLoaderArgs) {
  const resumo: ResumoData = {
    total_solicitacoes: 142,
    exames_recebidos: 105,
    laudos_emitidos: 98,
    total_pacientes: 67,
  };

  const solicitacoes_por_mes: ChartData[] = [
    { mes: "Jul", total: 35 },
    { mes: "Ago", total: 42 },
    { mes: "Set", total: 58 },
    { mes: "Out", total: 40 },
  ];

  const laudos_por_mes: ChartData[] = [
    { mes: "Jul", total: 30 },
    { mes: "Ago", total: 38 },
    { mes: "Set", total: 51 },
    { mes: "Out", total: 35 },
  ];

  const exames_recentes: ExameData[] = [
    {
      id: 1,
      solicitacao_id: 101,
      codigo_solicitacao: "RM-001",
      paciente_id: 201,
      paciente_nome: "Maria Silva",
      nome_exame: "Ressonância Magnética",
      data_realizacao: new Date("2025-10-24T14:30:00Z").toISOString(),
      nome_laboratorio: "Clínica Imagem",
      tem_laudo: true,
    },
    {
      id: 2,
      solicitacao_id: 102,
      codigo_solicitacao: "TC-002",
      paciente_id: 202,
      paciente_nome: "João Santos",
      nome_exame: "Tomografia",
      data_realizacao: new Date("2025-10-23T10:00:00Z").toISOString(),
      nome_laboratorio: "LabX",
      tem_laudo: false,
    },
    {
      id: 3,
      solicitacao_id: 103,
      codigo_solicitacao: "RX-003",
      paciente_id: 203,
      paciente_nome: "Ana Costa",
      nome_exame: "Raio-X",
      data_realizacao: new Date("2025-10-23T09:15:00Z").toISOString(),
      nome_laboratorio: "Clínica Imagem",
      tem_laudo: true,
    },
    {
      id: 4,
      solicitacao_id: 104,
      codigo_solicitacao: "US-004",
      paciente_id: 204,
      paciente_nome: "Pedro Oliveira",
      nome_exame: "Ultrassom",
      data_realizacao: new Date("2025-10-22T16:45:00Z").toISOString(),
      nome_laboratorio: "LabX",
      tem_laudo: false,
    },
    {
      id: 5,
      solicitacao_id: 105,
      codigo_solicitacao: "RM-005",
      paciente_id: 205,
      paciente_nome: "Carla Souza",
      nome_exame: "Ressonância (Crânio)",
      data_realizacao: new Date("2025-10-22T11:30:00Z").toISOString(),
      nome_laboratorio: "Clínica Imagem",
      tem_laudo: true,
    },
  ];

  return {
    resumo,
    solicitacoes_por_mes,
    laudos_por_mes,
    exames_recentes,
  } as DashboardData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const data = loaderData;
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section>
      {(() => {
        switch (user.tipo) {
          case "medico":
            return <MedicoDashboard />;
          case "paciente":
            return <PacienteHomePage />;
          case "funcionario":
            return <FuncionarioHomePage />;
          default:
            // Caso de fallback (não deve acontecer se o AuthProvider estiver correto)
            return (
              <div className="container mx-auto py-8">
                <p>Perfil de usuário não reconhecido.</p>
              </div>
            );
        }
      })()}
    </section>
  );
}
