import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

import { Terminal } from "lucide-react";

import { Form } from "~/components/ui/form";
import type { Route } from "./+types/new";
import { createLaudoSchema, type CreateLaudoForm } from "~/schemas/laudo";
import { pacienteService } from "~/services/pacientes";
import { Stepper } from "~/components/stepper";
import { Step1Form } from "~/components/laudagem/step1";
import { Step2Form } from "~/components/laudagem/step2";
import { mockPacientesData } from "~/lib/mock";
import { laudoService } from "~/services/laudos";
import type { CriarLaudo } from "~/types/laudo";
import { useQueryClient } from "@tanstack/react-query";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const pacientes = await pacienteService.readAll({});
    return { pacientes: mockPacientesData, error: null };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao carregar dados.", { description: errorMessage });
    console.log(mockPacientesData);
    return {
      pacientes: mockPacientesData,
      error: errorMessage,
    };
  }
}

const steps = [
  { id: 1, name: "Selecionar Exames" },
  { id: 2, name: "Formulário do Laudo" },
];

export default function CriarLaudoPage({ loaderData }: Route.ComponentProps) {
  const { pacientes, error } = loaderData;
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  console.log(pacientes);

  const form = useForm<CreateLaudoForm>({
    resolver: zodResolver(createLaudoSchema),
    defaultValues: {
      step1: {
        paciente_id: 0,
        exames: [],
      },
      step2: {
        titulo: "",
        descricao: "",
      },
    },
  });

  const onSubmit = async (data: CreateLaudoForm) => {
    const isStep2Valid = await form.trigger("step2");
    if (!isStep2Valid) {
      toast.error("Verifique os campos obrigatórios do laudo.");
      return;
    }

    try {
      await laudoService.create({
        paciente_id: data.step1.paciente_id,
        titulo: data.step2.titulo,
        descricao: data.step2.descricao,
        exames_ids: data.step1.exames,
      } as CriarLaudo);
      console.log("Dados finais do formulário:", data);

      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Laudo criado com sucesso!");
      navigate("/home", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Erro ao criar o laudo.", { description: error.message });
      }
    }
  };

  return (
    <section>
      <div className="container mx-auto py-8 space-y-6">
        {/* Cabeçalho */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Criar Novo Laudo
          </h2>
          <p className="text-muted-foreground">
            Siga as etapas para criar um novo laudo.
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Alerta de Erro do Loader */}
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro ao Carregar Pacientes</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulário com Steps */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {currentStep === 1 && (
              <Step1Form
                pacientes={pacientes.pacientes}
                form={form}
                onNextStep={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <Step2Form form={form} onGoBack={() => setCurrentStep(1)} />
            )}
          </form>
        </Form>
      </div>
    </section>
  );
}
