import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { pacienteService } from '~/services/pacientes';
import useAuth from '~/hooks/useAuth';
import { useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Calendar as CalendarIcon, User, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import { solicitacaoService } from '~/services/solicitacoes';
import type { CriarSolicitacao } from '~/types/solicitacao';
//retirar abaixo
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { toast } from 'sonner';

const solicitacaoSchema = z.object({
  paciente_id: z.string().min(1, 'Paciente é obrigatório'),
  nome_exame: z.string().min(1, 'Nome do exame é obrigatório'),
  prioridade: z.string().min(1, 'Prioridade é obrigatória'),
  data: z.date(),
  hipotese_diagnostica: z.string().min(1, 'Hipótese diagnóstica é obrigatória'),
  detalhes_preparo: z.string().optional(),
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

export default function SolicitacaoExame() {
  const { user } = useAuth();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema) as unknown as Resolver<SolicitacaoFormData>,
    defaultValues: {
      paciente_id: '',
      nome_exame: '',
      prioridade: 'normal',
      data: new Date(),
      hipotese_diagnostica: '',
      detalhes_preparo: '',
    },
  });

  const [queryText, setQueryText] = useState<string>('');
  const [selectedPacienteLabel, setSelectedPacienteLabel] = useState<string>('');

  const pacientesQuery = useQuery({
    queryKey: ['pacientes', queryText],
    queryFn: async () => {
      const data = await pacienteService.readAll({
        q: queryText || undefined,
        page: 1,
        perPage: 20,
      });
      // normaliza para array (se o back devolver paginado)
      const list =
        Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.items)
            ? (data as any).items
            : Array.isArray((data as any)?.data)
              ? (data as any).data
              : [];
      return list;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  // const pacientesQuery = useQuery({
  //   queryKey: ['pacientes', queryText],
  //   queryFn: () => getPacientes(queryText),
  //   staleTime: 1000 * 60 * 2,
  //   refetchOnWindowFocus: false,
  //   enabled: true,
  // });

  const onSubmit: SubmitHandler<SolicitacaoFormData> = async (values) => {
    try {
      const formData: CriarSolicitacao = {
        paciente_id: Number(values.paciente_id),
        nome_exame: values.nome_exame,
        prioridade: values.prioridade as 'normal' | 'emergencia',
        data: values.data,
        hipotese_diagnostica: values.hipotese_diagnostica,
        detalhes_preparo: values.detalhes_preparo ?? '',
      };
      await solicitacaoService.create(formData);
      toast.success('Solicitação de exame enviada com sucesso!');
      reset();

      setSelectedPacienteLabel('');
      setQueryText('');

    } catch (err) {
      console.error('Erro ao criar solicitação:', err);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    }
  };
  const [isPacienteInputFocused, setIsPacienteInputFocused] = useState(false);

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
              <Controller
                control={control}
                name="paciente_id"
                render={({ field }) => (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="pacienteQuery"
                        className="pl-9 w-full border rounded-md px-3 py-2"
                        placeholder="Buscar por nome ou CPF"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        onFocus={() => setIsPacienteInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsPacienteInputFocused(false), 200)}
                      />
                    </div>

                    {(isPacienteInputFocused || queryText.length > 0) && (
                      <div className="mt-2 border rounded-md bg-white max-h-60 overflow-auto z-10 absolute w-full">
                        {pacientesQuery.isLoading && <p className="text-sm text-gray-500 p-2">Buscando...</p>}
                        {pacientesQuery.isError && <p className="text-sm text-red-600 p-2">{(pacientesQuery.error as any)?.message ?? 'Erro ao buscar pacientes'}</p>}
                        
                        {Array.isArray(pacientesQuery.data) && (() => {
                          const q = queryText.trim().toLowerCase();
                          const filtered = pacientesQuery.data.filter((p: any) => {
                            if (!q) return true;
                            
                            const nome = (p.nome || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()).toLowerCase();
                            const nomeMatch = nome.includes(q);
                            
                            const cpfNumeros = (p.cpf || '').replace(/\D/g, '');
                            const queryNumeros = q.replace(/\D/g, '');
                            const cpfMatch = cpfNumeros.includes(queryNumeros);
                            
                            return nomeMatch || cpfMatch;
                          });
                          
                          return (
                            <>
                              {filtered.map((p: any) => (
                                <button
                                  type="button"
                                  key={p.id ?? p._id}
                                  onClick={() => {
                                    const id = String(p.id ?? p._id ?? '');
                                    field.onChange(id);
                                    setSelectedPacienteLabel(p.nome || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim());
                                    setQueryText('');
                                    setIsPacienteInputFocused(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{p.nome || p.name}</span>
                                    <span className="text-sm text-muted-foreground">{p.cpf ?? ''}</span>
                                  </div>
                                </button>
                              ))}
                              {filtered.length === 0 && (
                                <p className="text-sm text-gray-500 p-2">Nenhum paciente encontrado.</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {errors.paciente_id && <p className="text-sm text-red-600">{(errors.paciente_id as any)?.message ?? 'Paciente é obrigatório'}</p>}
                    {selectedPacienteLabel && <p className="mt-2 text-sm">Selecionado: {selectedPacienteLabel}</p>}
                  </div>
                )}
              />
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
                <Input id="nome_exame" {...register('nome_exame')} />
                {errors.nome_exame && <p className="text-sm text-red-600">{errors.nome_exame.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Controller
                  control={control}
                  name="prioridade"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                      <SelectTrigger id="prioridade" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="emergencia">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.prioridade && <p className="text-sm text-red-600">{(errors.prioridade as any)?.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="data">Data da Solicitação *</Label>
                <Controller
                  control={control}
                  name="data"
                  render={({ field }) => {
                    const dateValue = field.value instanceof Date ? field.value : new Date(field.value);
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateValue ? format(dateValue, "yyyy-MM-dd") : 'Selecione a data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateValue}
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
                {errors.data && (<p className="text-sm text-red-600 mt-1">{errors.data.message}</p>
                )}</div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hipotese_diagnostica">Hipótese Diagnóstica *</Label>
                <Textarea id="hipotese_diagnostica" {...register('hipotese_diagnostica')} className="min-h-[120px]" />
                {errors.hipotese_diagnostica && <p className="text-sm text-red-600">{(errors.hipotese_diagnostica as any)?.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="detalhes_preparo">Detalhes do Preparo</Label>
                <Textarea id="detalhes_preparo" {...register('detalhes_preparo')} className="min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          {/* Alert "Importante" (Conteúdo e cor atualizados) */}
          <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
            <Info className="h-5 w-5 text-yellow-600" />
            <AlertDescription>
              <span className="font-semibold">Importante:</span> Após a confirmação, um e-mail
              será enviado ao paciente com as instruções e credenciais de acesso
              para acompanhar o status da solicitação.
            </AlertDescription>
          </Alert>

          {/* Botões de Ação (Atualizados) */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-[85%]"
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Solicitação'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-[15%]"
              onClick={() => {
                reset();
                setSelectedPacienteLabel('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}