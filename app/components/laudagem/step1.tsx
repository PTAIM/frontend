import { useState } from "react";
import { useForm } from "react-hook-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Skeleton } from "../../components/ui/skeleton";

import { Check, ChevronsUpDown, ArrowRight, Search, User } from "lucide-react";

import { cpfMask } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { FormField, FormItem } from "~/components/ui/form";
import type { CreateLaudoForm } from "~/schemas/laudo";
import type { PacienteData, PacientesData } from "~/types/paciente";
import { pacienteService } from "~/services/pacientes";
import { useDebounce } from "~/hooks/debounce";
import { exameService } from "~/services/exames";

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

      const data = await pacienteService.readFiltered({
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

const useExamesPorPaciente = (pacienteId: number | null) => {
  return useQuery({
    queryKey: ["exames-por-paciente", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null;
      const data = await exameService.readAll({ paciente_id: pacienteId });
      return data;
    },
    enabled: !!pacienteId,
    staleTime: 0,
  });
};

interface Step1FormProps {
  pacientes: PacienteData[];
  form: ReturnType<typeof useForm<CreateLaudoForm>>;
  onNextStep: () => void;
}

export function Step1Form({ pacientes, form, onNextStep }: Step1FormProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 500);
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteData | null>(
    null,
  );

  const selectedPacienteId = form.watch("step1.paciente_id");
  const {
    data,
    isLoading: isLoadingExames,
    isError: isErrorExames,
  } = useExamesPorPaciente(
    selectedPacienteId ? Number(selectedPacienteId) : null,
  );

  const {
    data: pacientesResult,
    isLoading: isLoadingPacientes,
    isError: isErrorPacientes,
  } = usePacientesSearch(debouncedSearch);

  const handleSelectPaciente = (paciente: PacienteData) => {
    form.setValue("step1.paciente_id", paciente.id);
    form.setValue("step1.exames", []); // Reseta exames
    setSelectedPaciente(paciente);
    setLocalSearch(""); // Limpa a busca
  };

  const handleChangePaciente = () => {
    form.setValue("step1.paciente_id", 0);
    form.setValue("step1.exames", []);
    setSelectedPaciente(null);
  };

  const exames = data?.items ?? [];

  const handleNext = async () => {
    const isValid = await form.trigger("step1");
    if (isValid) {
      onNextStep();
    } else {
      toast.error("Verifique os campos obrigatórios.", {
        description: "Você precisa selecionar um paciente e ao menos um exame.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etapa 1: Selecionar Paciente e Exames</CardTitle>
        <CardDescription>
          Escolha um paciente para ver seus exames disponíveis para laudagem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium flex items-center">
            <User className="mr-2 h-4 w-4" />
            Selecionar Paciente
          </label>

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
                      : "Busque por um paciente"}
                  </CommandEmpty>
                  {isErrorPacientes && (
                    <p className="p-4 text-center text-sm text-red-600">
                      Erro ao buscar.
                    </p>
                  )}
                  {pacientesResult && pacientesResult.items.length > 0 && (
                    <CommandGroup>
                      {pacientesResult.items.map((paciente: PacienteData) => (
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
                            <p className="font-medium">{paciente.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {cpfMask(paciente.cpf)}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
        {/* Tabela de Exames */}
        <FormField
          control={form.control}
          name="step1.exames"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            !isLoadingExames &&
                            exames &&
                            exames.length > 0 &&
                            field.value?.length === exames.length
                          }
                          onCheckedChange={(checked) => {
                            if (checked && exames) {
                              field.onChange(exames.map((e) => e.id));
                            } else {
                              field.onChange([]);
                            }
                          }}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                      <TableHead>Exame</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Laboratório</TableHead>
                      <TableHead>Paciente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingExames ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-5 w-5" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : isErrorExames ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-red-600"
                        >
                          Erro ao carregar exames.
                        </TableCell>
                      </TableRow>
                    ) : !exames || exames.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {selectedPacienteId
                            ? "Nenhum exame pendente para este paciente."
                            : "Selecione um paciente para ver os exames."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      exames.map((exame) => (
                        <TableRow
                          key={exame.id}
                          data-state={
                            field.value?.includes(exame.id) && "selected"
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={field.value?.includes(exame.id)}
                              onCheckedChange={(checked) => {
                                const newValue = [...(field.value || [])];
                                if (checked) {
                                  newValue.push(exame.id);
                                } else {
                                  const index = newValue.indexOf(exame.id);
                                  if (index > -1) newValue.splice(index, 1);
                                }
                                field.onChange(newValue);
                              }}
                              aria-label={`Selecionar ${exame.nome_exame}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {exame.nome_exame}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(exame.data_realizacao),
                              "dd/MM/yyyy",
                            )}
                          </TableCell>
                          <TableCell>{exame.nome_laboratorio}</TableCell>
                          <TableCell>{exame.paciente_nome}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleNext}>
          Continuar para Laudagem
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
