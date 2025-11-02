import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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

import { Check, ChevronsUpDown, ArrowRight } from "lucide-react";

import { cn } from "~/lib/utils";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import type { CreateLaudoForm } from "~/schemas/laudo";
import type { PacienteData, PacientesData } from "~/types/paciente";
import { mockRecentExams } from "~/lib/mock";
import type { ExamesData } from "~/types/exame";

const useExamesPorPaciente = (pacienteId: number | null) => {
  return useQuery({
    queryKey: ["exames-por-paciente", pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null; // Simulação de API
      console.log(`Buscando exames para paciente ID: ${pacienteId}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Dados mockados
      return {
        exames: mockRecentExams,
        total: 28,
        page: 1,
        limit: 4,
      } as ExamesData;
    },
    enabled: !!pacienteId,
    staleTime: 1000 * 60 * 5,
  });
};

interface Step1FormProps {
  pacientes: PacienteData[];
  form: ReturnType<typeof useForm<CreateLaudoForm>>;
  onNextStep: () => void;
}

export function Step1Form({ pacientes, form, onNextStep }: Step1FormProps) {
  const [openPopover, setOpenPopover] = useState(false);

  const selectedPacienteId = form.watch("step1.paciente_id");
  const {
    data,
    isLoading: isLoadingExames,
    isError: isErrorExames,
  } = useExamesPorPaciente(
    selectedPacienteId ? Number(selectedPacienteId) : null,
  );

  const exames = data?.exames ?? [];

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
        {/* Select de Paciente */}
        <FormField
          control={form.control}
          name="step1.paciente_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full max-w-md justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? pacientes.find((p) => p.id === Number(field.value))
                            ?.nome
                        : "Selecione um paciente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar paciente..." />
                    <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {pacientes.map((paciente) => (
                        <CommandItem
                          value={paciente.nome}
                          key={paciente.id}
                          onSelect={() => {
                            form.setValue(
                              "step1.paciente_id",
                              String(paciente.id),
                            );
                            form.setValue("step1.exames", []); // Reseta exames
                            setOpenPopover(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              Number(field.value) === paciente.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {paciente.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

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
