import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Info,
  X,
  FileText,
  CalendarIcon,
  InfoIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { toast } from "sonner";
import type { Route } from "./+types/upload";
import { uploadExamSchema } from "~/schemas/exame";
import { exameService } from "~/services/exames";
import type { CriarExame } from "~/types/exame";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upload de Exame - MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

type ExamFormData = z.infer<typeof uploadExamSchema>;

function InstructionCard() {
  return (
    <Card className="shadow-lg mb-8">
      <CardContent>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Como usar:</h2>
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
              Faça upload do arquivo do exame
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
  );
}

export default function ExamUpload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [showInstruction, setShowInstructions] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ExamFormData>({
    resolver: zodResolver(uploadExamSchema),
  });

  const examDate = watch("data_realizacao");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValue("arquivo", selectedFile, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ExamFormData) => {
    const formData: CriarExame = {
      codigo_solicitacao: data.codigo_solicitacao,
      data_realizacao: data.data_realizacao,
      nome_laboratorio: data.nome_laboratorio,
      observacoes: data.observacoes,
      arquivo: data.arquivo,
    };

    try {
      await exameService.create(formData);
      await queryClient.invalidateQueries({ queryKey: ["exames-recentes"] });
      toast.success(`Exame ${data.codigo_solicitacao} enviado com sucesso!`);
      navigate("/home", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Erro ao enviar exame.", {
          description: error.message,
        });
      }
    }

    reset();
    setFile(null);
  };

  return (
    <section>
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Enviar Novo Exame
            </h2>
            <p className="text-muted-foreground">
              Preencha os dados e anexe o arquivo do exame.
            </p>
          </div>
          <Button
            variant={"outline"}
            size="icon-lg"
            type="button"
            className="rounded-full"
            onClick={() => setShowInstructions(!showInstruction)}
          >
            <InfoIcon></InfoIcon>
          </Button>
        </div>

        {showInstruction && <InstructionCard />}
        {/* Formulário */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="codigo_solicitacao"
                  className="text-base font-semibold"
                >
                  Código do Exame
                </Label>
                <CardDescription className="mt-1 mb-3">
                  Digite o código único fornecido pelo médico
                </CardDescription>
                <div className="flex gap-3">
                  <Input
                    id="codigo_solicitacao"
                    {...register("codigo_solicitacao")}
                    placeholder="Ex: LZ6Y-ombd9"
                    className="flex-1 p-4"
                  />
                </div>
                {errors.codigo_solicitacao && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.codigo_solicitacao.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="nome_laboratorio"
                  className="text-base font-semibold"
                >
                  Nome do Laboratório
                </Label>
                <CardDescription className="mt-1 mb-3">
                  Informe o nome do laboratório onde o exame foi realizado
                </CardDescription>
                <Input
                  id="nome_laboratorio"
                  {...register("nome_laboratorio")}
                  placeholder="Ex: Laboratório São Lucas"
                />
                {errors.nome_laboratorio && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.nome_laboratorio.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Data de Realização
                </Label>
                <CardDescription className="mt-1 mb-3">
                  Selecione a data em que o exame foi realizado
                </CardDescription>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full max-w-3xs justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate
                        ? format(examDate, "PPP", {
                            locale: ptBR,
                          })
                        : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      captionLayout="dropdown"
                      onSelect={(date) =>
                        setValue("data_realizacao", date!, {
                          shouldValidate: true,
                        })
                      }
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.data_realizacao && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.data_realizacao.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="observacoes"
                  className="text-base font-semibold"
                >
                  Observações
                </Label>
                <CardDescription className="mt-1 mb-3">
                  Adicione informações adicionais sobre o exame (opcional)
                </CardDescription>
                <Textarea
                  id="observacoes"
                  {...register("observacoes")}
                  placeholder="Ex: Paciente em jejum, exame realizado pela manhã..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Arquivo do Exame
                </Label>

                {!file ? (
                  <div className="border-2 border-dashed rounded-xl p-12 text-center border-gray-300">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">
                      Selecione o arquivo do exame
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Clique para escolher o arquivo
                    </p>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.dcm"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="fileInput"
                    />
                    <label htmlFor="fileInput">
                      <Button asChild className="bg-blue-500 hover:bg-blue-600">
                        <span>Selecionar Arquivo</span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-4">
                      Formatos aceitos: JPEG, PNG, PDF, DICOM
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setValue("arquivo", null as any);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {errors.arquivo && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.arquivo.message}
                  </p>
                )}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertDescription>
                  <p className="font-semibold text-blue-900 mb-2">
                    Importante:
                  </p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>Certifique-se de que o código do exame está correto</li>
                    <li>O arquivo deve estar legível e completo</li>
                    <li>
                      O médico será notificado automaticamente após o envio
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full bg-gray-700 hover:bg-gray-800 h-12 disabled:opacity-50"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Exame"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
