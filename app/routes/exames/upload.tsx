import { useState } from 'react';
import { Upload, Info, Activity, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { uploadExamSchema } from '~/schemas/exame';
import { toast } from 'sonner';

type ExamFormData = z.infer<typeof uploadExamSchema>;

export default function ExamUpload() {
  const [examCode, setExamCode] = useState<string>('');
  const [examDate, setExamDate] = useState<Date | undefined>();
  const [labName, setLabName] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleValidate = () => {
    if (examCode.trim()) {
      alert(`Validando código: ${examCode}`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      setIsSubmitting(true);

      const formData: ExamFormData = {
        codigo_solicitacao: examCode,
        data_realizacao: examDate!,
        nome_laboratorio: labName,
        observacoes: observations || undefined,
        arquivos: files,
      };

      const validatedData = uploadExamSchema.parse(formData);

      const submitFormData = new FormData();
      submitFormData.append('codigo_solicitacao', validatedData.codigo_solicitacao);
      submitFormData.append(
        'data_realizacao',
        validatedData.data_realizacao.toISOString()
      );
      submitFormData.append('nome_laboratorio', validatedData.nome_laboratorio);
      
      if (validatedData.observacoes) {
        submitFormData.append('observacoes', validatedData.observacoes);
      }

      validatedData.arquivos.forEach((file, index) => {
        submitFormData.append(`arquivo_${index}`, file);
      });

      console.log('Dados validados:', validatedData);
      toast.success(`Enviando ${files.length} arquivo(s) para o exame ${examCode}`);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err: { path: string | any[]; message: string; }) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Erro ao enviar exame:', error);
        toast.error('Erro ao enviar exame. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-xl p-2">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Upload de Exames</h1>
              <p className="text-sm text-gray-500">Clínica São Lucas</p>
            </div>
          </div>
          <Button variant="ghost">Sair</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="mb-8">
              <Label htmlFor="examCode" className="text-base font-semibold">
                Código do Exame
              </Label>
              <CardDescription className="mt-1 mb-4">
                Digite o código único fornecido pelo médico para identificar o exame
              </CardDescription>
              <div className="flex gap-3">
                <Input
                  id="examCode"
                  type="text"
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value)}
                  placeholder="Ex: EX-2024-001"
                  className="flex-1"
                />
                <Button onClick={handleValidate} className="bg-blue-500 hover:bg-blue-600">
                  Validar
                </Button>
              </div>
              {errors.codigo_solicitacao && (
                <p className="text-sm text-red-600 mt-1">{errors.codigo_solicitacao}</p>
              )}
            </div>

            <div className="mb-8">
              <Label htmlFor="labName" className="text-base font-semibold">
                Nome do Laboratório
              </Label>
              <CardDescription className="mt-1 mb-4">
                Informe o nome do laboratório onde o exame foi realizado
              </CardDescription>
              <Input
                id="labName"
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="Ex: Laboratório São Lucas"
              />
              {errors.nome_laboratorio && (
                <p className="text-sm text-red-600 mt-1">{errors.nome_laboratorio}</p>
              )}
            </div>

            <div className="mb-8">
              <Label htmlFor="examDate" className="text-base font-semibold">
                Data de Realização
              </Label>
              <CardDescription className="mt-1 mb-4">
                Informe a data em que o exame foi realizado
              </CardDescription>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full max-w-xs justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {examDate ? format(examDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={examDate}
                    onSelect={setExamDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.data_realizacao && (
                <p className="text-sm text-red-600 mt-1">{errors.data_realizacao}</p>
              )}
            </div>

            <div className="mb-8">
              <Label htmlFor="observations" className="text-base font-semibold">
                Observações
              </Label>
              <CardDescription className="mt-1 mb-4">
                Adicione informações adicionais sobre o exame (opcional)
              </CardDescription>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Paciente em jejum, exame realizado pela manhã..."
                className="min-h-[100px]"
              />
            </div>

            <div className="mb-8">
              <Label className="text-base font-semibold mb-4 block">
                Arquivos do Exame
              </Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium mb-2">
                  Arraste e solte os arquivos aqui
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou clique para selecionar
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.dcm"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput">
                  <Button asChild className="bg-blue-500 hover:bg-blue-600">
                    <span>Selecionar Arquivos</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Formatos aceitos: JPEG, PNG, PDF, DICOM
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Arquivos selecionados ({files.length}):
                  </p>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm bg-gray-100 px-3 py-2 rounded flex items-center justify-between gap-2">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.arquivos && (
                <p className="text-sm text-red-600 mt-1">{errors.arquivos}</p>
              )}
            </div>

            <Alert className="mb-8 bg-blue-50 border-blue-200">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertDescription>
                <p className="font-semibold text-blue-900 mb-2">Importante:</p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>Certifique-se de que o código do exame está correto</li>
                  <li>Envie todos os arquivos relacionados ao exame</li>
                  <li>O médico será notificado automaticamente após o envio</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gray-700 hover:bg-gray-800 h-12 disabled:opacity-50"
            >
              <Upload className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar Exame'}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Como usar:</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <span className="text-gray-900">
                  Digite o código único fornecido pelo médico
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <span className="text-gray-900">
                  Clique em "Validar" para verificar se o código está correto
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <span className="text-gray-900">
                  Preencha o nome do laboratório e a data de realização
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                <span className="text-gray-900">
                  Faça upload de todos os arquivos do exame
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  5
                </span>
                <span className="text-gray-900">
                  Clique em "Enviar Exame" para finalizar
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}