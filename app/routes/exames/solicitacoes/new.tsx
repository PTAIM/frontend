import { useState } from "react";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { pacienteService } from "~/services/pacientes";
import useAuth from "~/hooks/useAuth";
import {
  useForm,
  Controller,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Info,
  Calendar as CalendarIcon,
  User,
  FileText,
  Search,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { solicitacaoService } from "~/services/solicitacoes";
import type { CriarSolicitacao } from "~/types/solicitacao";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { toast } from "sonner";
import { solicitacaoSchema } from "~/schemas/exame";
import { useDebounce } from "~/hooks/debounce";
import type { PacienteData } from "~/types/paciente";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { cn, cpfMask } from "~/lib/utils";
import { Link, useNavigate } from "react-router";

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

const usePacientesSearch = (
  search: string,
  page: number = 1,
  limit: number = 20,
) => {
  return useQuery({
    queryKey: ["pacientes-search", search],
    queryFn: async () => {
      if (search.trim().length == 0) {
        return { items: [], total: 0, page: 0, limit: 0 };
      }
      const data = await pacienteService.readAll({
        search: search || undefined,
        page: page,
        limit: limit,
      });

      return data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export default function SolicitacaoExame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openPopover, setOpenPopover] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 500);
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteData | null>(
    null,
  );

  const {
    data: pacientesResult,
    isLoading: isLoadingPacientes,
    isError: isErrorPacientes,
  } = usePacientesSearch(debouncedSearch);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(
      solicitacaoSchema,
    ) as unknown as Resolver<SolicitacaoFormData>,
    defaultValues: {
      paciente_id: 0,
      nome_exame: "",
      data: new Date(),
      hipotese_diagnostica: "",
      detalhes_preparo: "",
    },
  });

  const selectedPacienteId = watch("paciente_id");

  const handleSelectPaciente = (paciente: PacienteData) => {
    setValue("paciente_id", paciente.id);
    setSelectedPaciente(paciente);
    setLocalSearch(""); // Limpa a busca
  };

  const handleChangePaciente = () => {
    setValue("paciente_id", 0);
    setSelectedPaciente(null);
  };

  const onSubmit: SubmitHandler<SolicitacaoFormData> = async (values) => {
    try {
      const formData: CriarSolicitacao = {
        paciente_id: Number(values.paciente_id),
        nome_exame: values.nome_exame,
        data: values.data,
        hipotese_diagnostica: values.hipotese_diagnostica,
        detalhes_preparo: values.detalhes_preparo ?? "",
      };
      await solicitacaoService.create(formData);

      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Solicitação de exame enviada com sucesso!");
      reset();
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Erro ao criar solicitação:", err);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    }
  };

  return (
    // Fundo da página ajustado
    <div className="min-h-screen bg-gray-50">
      {/* Header atualizado */}

      {/* Layout principal atualizado para conter o formulário */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Solicitar Exame</h1>
          <p className="text-gray-600 mt-1">
            Selecione um paciente e preencha os dados da solicitação
          </p>
        </div>

        {/* Envolvemos tudo em um <form> */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card 1: Selecionar Paciente (Novo) */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <User className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">Selecionar Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {selectedPacienteId ? (
                  <div className="flex items-center justify-between rounded-md border border-input bg-background p-4">
                    <div>
                      <p className="font-medium">{selectedPaciente?.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {cpfMask(selectedPaciente?.cpf ?? "")}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Paciente selecionado
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChangePaciente}
                    >
                      Alterar
                    </Button>
                  </div>
                ) : (
                  <Popover open={openPopover} onOpenChange={setOpenPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full max-w-md justify-between"
                      >
                        Buscar por nome ou CPF...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Buscar por nome ou CPF..."
                          value={localSearch}
                          onValueChange={setLocalSearch}
                        />
                        <CommandEmpty>
                          {isLoadingPacientes
                            ? "Buscando..."
                            : "Nenhum paciente encontrado."}
                        </CommandEmpty>
                        {isErrorPacientes && (
                          <p className="p-4 text-center text-sm text-red-600">
                            Erro ao buscar.
                          </p>
                        )}
                        {pacientesResult &&
                          pacientesResult.items.length > 0 && (
                            <CommandGroup>
                              {pacientesResult.items.map(
                                (paciente: PacienteData) => (
                                  <CommandItem
                                    key={paciente.id}
                                    value={paciente.nome}
                                    onSelect={() => {
                                      handleSelectPaciente(paciente);
                                      setOpenPopover(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedPacienteId === paciente.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div>
                                      <p className="font-medium">
                                        {paciente.nome}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {cpfMask(paciente.cpf)}
                                      </p>
                                    </div>
                                  </CommandItem>
                                ),
                              )}
                            </CommandGroup>
                          )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Dados da Solicitação (Campos de formulário) */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <FileText className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">Dados da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="nome_exame">Nome do Exame *</Label>
                <Input
                  id="nome_exame"
                  placeholder="Nome do Exame"
                  {...register("nome_exame")}
                />
                {errors.nome_exame && (
                  <p className="text-sm text-red-600">
                    {errors.nome_exame.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data da Solicitação *</Label>
                <Controller
                  control={control}
                  name="data"
                  render={({ field }) => {
                    const dateValue =
                      field.value instanceof Date
                        ? field.value
                        : new Date(field.value);
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateValue
                              ? format(dateValue, "PPP", { locale: ptBR })
                              : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateValue}
                            captionLayout="dropdown"
                            onSelect={(d: Date | undefined) => {
                              if (d) field.onChange(d);
                            }}
                            locale={ptBR}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.data && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.data.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hipotese_diagnostica">
                  Hipótese Diagnóstica *
                </Label>
                <Textarea
                  placeholder="Descreva os sintomas, histórico clínico relevante e motivo da solicitação"
                  id="hipotese_diagnostica"
                  {...register("hipotese_diagnostica")}
                  className="min-h-[120px]"
                />
                {errors.hipotese_diagnostica && (
                  <p className="text-sm text-red-600">
                    {(errors.hipotese_diagnostica as any)?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="detalhes_preparo">Detalhes do Preparo</Label>
                <Textarea
                  placeholder="Informações adicionais que possam ser relevantes"
                  id="detalhes_preparo"
                  {...register("detalhes_preparo")}
                  className="min-h-[100px]"
                />
              </div>

              {/* Alert "Importante" (Conteúdo e cor atualizados) */}
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900 md:col-span-2">
                <Info className="h-5 w-5 text-yellow-600" />
                <AlertDescription>
                  <span className="font-semibold">Importante:</span> Após a
                  confirmação, um e-mail será enviado ao paciente com as
                  instruções e credenciais de acesso para acompanhar o status da
                  solicitação.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <Link to="/home">Cancelar</Link>
              </Button>
              <Button type="submit">Confirmar Solicitação</Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
