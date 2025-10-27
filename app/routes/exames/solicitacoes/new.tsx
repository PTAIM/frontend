import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '~/hooks/useAuth';
// Ícones: Adicionados User, FileText, Search. Removidos Upload, Activity, X.
import { Info, Calendar as CalendarIcon, User, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

// Componentes da UI: Adicionados Select e Avatar
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { toast } from 'sonner';

// Schema de validação atualizado para os campos da solicitação
const solicitacaoSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  medicoId: z.string().min(1, 'Médico é obrigatório'),
  tipoExame: z.string().min(1, 'Tipo de exame é obrigatório'),
  prioridade: z.string().min(1, 'Prioridade é obrigatória'),
  dataSolicitacao: z.preprocess((arg) => {
    if (arg instanceof Date) return arg;
    if (typeof arg === 'string' || typeof arg === 'number') {
      const d = new Date(arg);
      return isNaN(d.getTime()) ? arg : d;
    }
    return arg;
  }, z.date()),
  hipoteseDiagnostica: z.string().min(1, 'Hipótese diagnóstica é obrigatória'),
  detalhesPreparo: z.string().optional(),
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

export default function SolicitacaoExame() {
  const { user } = useAuth();
  const [pacienteQuery, setPacienteQuery] = useState<string>('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<{
    id: string;
    nome: string;
    cpf?: string;
    email?: string;
  } | null>(null);
  
  const [tipoExame, setTipoExame] = useState<string>('');
  const [prioridade, setPrioridade] = useState<string>('normal'); 
  const [dataSolicitacao, setDataSolicitacao] = useState<Date | undefined>(new Date());
  const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState<string>('');
  const [detalhesPreparo, setDetalhesPreparo] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      try {
        const res = await axios.get('/pacientes', {
          params: { q: pacienteQuery || undefined }, // envia query quando houver
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        const data = res.data;
        // Proteção: se o servidor devolveu HTML (index.html) não tentar parsear como JSON
        if (typeof data === 'string' && data.trim().startsWith('<')) {
          console.warn('Endpoint /api/pacientes retornou HTML. Verifique URL/baseURL do backend.');
          return;
        }
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0 && !pacienteSelecionado) {
          const p = data[0];
          setPacienteSelecionado({
            id: p.id?.toString() ?? p._id?.toString() ?? String(p.id ?? ''),
            nome: p.nome || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Paciente',
            cpf: p.cpf,
            email: p.email,
          });
        }
      } catch (err: any) {
        // evita tentar parse de HTML (quando endpoint não existe) e loga info útil
        if (axios.isAxiosError(err)) {
          console.error('Erro ao buscar pacientes:', err.response?.status, err.response?.data);
        } else if (err?.name === 'CanceledError' || err?.message === 'canceled') {
          // request abortada — ignorar
        } else {
          console.error('Erro ao buscar pacientes:', err);
        }
      }
    }, 300); // debounce simples para a busca por query

    return () => {
      mounted = false;
      clearTimeout(handler);
      controller.abort();
    };
  }, [pacienteQuery, pacienteSelecionado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Adicionado para lidar com o <form>
    try {
      setErrors({});
      setIsSubmitting(true);

      const formData: SolicitacaoFormData = {
        pacienteId: pacienteSelecionado?.id ?? '',
        medicoId: String(user?.id ?? ''),
        tipoExame: tipoExame,
        prioridade: prioridade,
        dataSolicitacao: dataSolicitacao ?? new Date(),
        hipoteseDiagnostica: hipoteseDiagnostica,
        detalhesPreparo: detalhesPreparo || undefined,
      };

      // Valida os dados com o novo schema
      const validatedData = solicitacaoSchema.parse(formData);

      // Enviar para API
      await axios.post('/api/exames/solicitacoes', validatedData);
      toast.success('Solicitação de exame enviada com sucesso!');
      
      toast.success('Solicitação de exame enviada com sucesso!');

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Preencha todos os campos obrigatórios.');
      } else {
        console.error('Erro ao enviar solicitação:', error);
        toast.error('Erro ao enviar solicitação. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Selecionar Paciente (Novo) */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <User className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">Selecionar Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="pacienteQuery"
                  type="text"
                  value={pacienteQuery}
                  onChange={(e) => setPacienteQuery(e.target.value)}
                  placeholder="Buscar por nome ou CPF"
                  className="pl-9"
                />
              </div>
              
              {/* Card do paciente selecionado (fixo) */}
              {pacienteSelecionado && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">{pacienteSelecionado.nome}</p>
                    <p className="text-sm text-blue-800">
                      {pacienteSelecionado.cpf} • {pacienteSelecionado.email}
                    </p>
                  </div>
                  <Button 
                    variant="link" 
                    className="text-blue-600"
                    onClick={() => setPacienteSelecionado(null as any)} // Simula o "Alterar"
                  >
                    Alterar
                  </Button>
                </div>
              )}
              {errors.pacienteId && !pacienteSelecionado && (
                <p className="text-sm text-red-600">{errors.pacienteId}</p>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Dados da Solicitação (Campos de formulário) */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <FileText className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">Dados da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Exame (Novo) */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="tipoExame">Tipo de Exame *</Label>
                <Select value={tipoExame} onValueChange={setTipoExame}>
                  <SelectTrigger id="tipoExame" className="w-full">
                    <SelectValue placeholder="Selecione o tipo de exame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hemograma">Hemograma Completo</SelectItem>
                    <SelectItem value="raio-x">Raio-X</SelectItem>
                    <SelectItem value="ressonancia">Ressonância Magnética</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoExame && (
                  <p className="text-sm text-red-600">{errors.tipoExame}</p>
                )}
              </div>

              {/* Prioridade (Novo) */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select value={prioridade} onValueChange={setPrioridade}>
                  <SelectTrigger id="prioridade" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data da Solicitação (Modificado) */}
              <div className="space-y-2">
                <Label htmlFor="dataSolicitacao">Data da Solicitação *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {/* Formato de data ajustado para 'yyyy-MM-dd' como na imagem */}
                      {dataSolicitacao ? format(dataSolicitacao, "yyyy-MM-dd") : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataSolicitacao}
                      onSelect={setDataSolicitacao}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.dataSolicitacao && (
                  <p className="text-sm text-red-600 mt-1">{errors.dataSolicitacao}</p>
                )}
              </div>

              {/* Hipótese Diagnóstica */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hipoteseDiagnostica">Hipótese Diagnóstica *</Label>
                <Textarea
                  id="hipoteseDiagnostica"
                  value={hipoteseDiagnostica}
                  onChange={(e) => setHipoteseDiagnostica(e.target.value)}
                  placeholder="Descreva a hipótese diagnóstica e motivo da solicitação..."
                  className="min-h-[120px]"
                />
                {errors.hipoteseDiagnostica && (
                  <p className="text-sm text-red-600">{errors.hipoteseDiagnostica}</p>
                )}
              </div>

              {/* Detalhes do Preparo */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="detalhesPreparo">Detalhes do Preparo</Label>
                <Textarea
                  id="detalhesPreparo"
                  value={detalhesPreparo}
                  onChange={(e) => setDetalhesPreparo(e.target.value)}
                  placeholder="Instruções específicas de preparo para o exame..."
                  className="min-h-[100px]"
                />
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
              className="w-[85%]" /* ocupa 85% do espaço, usa estilo padrão do componente (azul do tema) */
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Solicitação'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-[15%]" /* ocupa os 15% restantes */
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}