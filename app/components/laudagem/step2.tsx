import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";

import {
  Check,
  ArrowLeft,
  FileText,
  FileImage,
  Wand2,
  Brain,
  ZoomOut,
  ZoomIn,
  Expand,
  X,
  Loader2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import { FormField, FormItem } from "~/components/ui/form";
import type { CreateLaudoForm } from "~/schemas/laudo";
import React, { Suspense, useMemo, useState } from "react";

const SimpleMDEEditor = React.lazy(() => import("react-simplemde-editor"));
import "easymde/dist/easymde.min.css";
import { cn } from "~/lib/utils";
import { exameService } from "~/services/exames";
import type { ExamesDetalhes } from "~/types/exame";
import { laudoService } from "~/services/laudos";
import type {
  AnalisarImagemRequest,
  ImageAnalysisResponse,
} from "~/types/laudo";

const useImagensPorExames = (exameIds: number[]) => {
  return useQuery({
    queryKey: ["imagensPorExames", exameIds],
    queryFn: async () => {
      if (exameIds.length === 0) return [];
      console.log(`Buscando imagens para exames IDs: ${exameIds.join(", ")}`);

      const data = await exameService.readByIds({ exame_ids: exameIds });
      return data;
    },
    enabled: exameIds.length > 0,
    staleTime: Infinity,
  });
};

const useAnaliseIA = () => {
  return useMutation<ImageAnalysisResponse, Error, AnalisarImagemRequest>({
    mutationFn: async (data) => {
      console.log(`Enviando imagem ${data.nome_arquivo} para análise de IA...`);

      const response = laudoService.analysis(data);

      if (response) {
        return response;
      }
      return {
        analysis_text:
          "Análise da IA (Mock):\n\n- Detectada leve assimetria na imagem " +
          data.nome_arquivo.split("/").pop() +
          ".\n- Nenhuma anomalia significativa encontrada.\n- Recomenda-se acompanhamento clínico.",
      };
    },
    onSuccess: (data) => {
      toast.success("Análise de IA concluída e adicionada ao laudo!");
    },
    onError: (error) => {
      toast.error("Erro na Análise de IA.", {
        description: error.message,
      });
    },
  });
};

const MarkdownEditor = ({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const mdeOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Descreva os achados detalhadamente...",
      status: false,
      previewClass: [
        "prose",
        "bg-background",
        "prose-sm",
        "dark:prose-invert",
        "p-4",
      ],
      toolbar: [
        "bold",
        "italic",
        "strikethrough",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "table",
        "|",
        "preview",
        "|",
        "guide",
      ],
    } as const;
  }, []);

  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <SimpleMDEEditor
        id="laudo-descricao"
        value={internalValue}
        onChange={setInternalValue}
        onBlur={() => {
          onChange(internalValue);
          onBlur();
        }}
        options={mdeOptions}
      />
    </Suspense>
  );
};

interface Step2FormProps {
  form: ReturnType<typeof useForm<CreateLaudoForm>>;
  onGoBack: () => void;
}

export function Step2Form({ form, onGoBack }: Step2FormProps) {
  const selectedExameIds = form.watch("step1.exames");

  const [selectedMedia, setSelectedMedia] = useState<ExamesDetalhes | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom em %

  const {
    data: imagens,
    isLoading: isLoadingImagens,
    isError: isErrorImagens,
  } = useImagensPorExames(selectedExameIds || []);

  const {
    mutate: runAnaliseIA,
    data: analiseResult,
    isPending: isAnalisePending,
  } = useAnaliseIA();

  const handleRunAnalise = () => {
    if (!selectedMedia || isPdf) {
      toast.error("Nenhuma imagem selecionada.", {
        description: "Por favor, selecione uma imagem (não PDF) para analisar.",
      });
      return;
    }
    // Envia apenas a URL/nome do arquivo selecionado
    runAnaliseIA({ nome_arquivo: selectedMedia.url_arquivo });
  };
  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      let newZoom = direction === "in" ? prev + 25 : prev - 25;
      if (newZoom < 50) newZoom = 50; // Limite mínimo de zoom
      if (newZoom > 300) newZoom = 300; // Limite máximo
      return newZoom;
    });
  };

  const isPdf = selectedMedia?.url_arquivo.endsWith(".pdf");

  const openMediaViewer = (media: ExamesDetalhes) => {
    setZoomLevel(100); // Reseta o zoom
    setSelectedMedia(media);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
  };

  const getAiCardDescription = () => {
    if (isAnalisePending) return "Analisando, por favor aguarde...";
    if (!selectedMedia) return "Selecione uma imagem para analisar.";
    if (isPdf) return "Análise de IA não disponível para arquivos PDF.";
    return "Clique para analisar a imagem selecionada.";
  };

  return (
    <>
      {/* LAYOUT PRINCIPAL (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Imagens e Análise IA */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de Imagens (Miniaturas) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="mr-2 h-5 w-5" />
                Visualizador de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingImagens ? (
                <Skeleton className="h-48 w-full" />
              ) : isErrorImagens ? (
                <Alert variant="destructive">
                  <AlertDescription>Erro ao carregar imagens.</AlertDescription>
                </Alert>
              ) : !imagens || imagens.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  Nenhuma imagem encontrada.
                </p>
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {imagens.map((img) => {
                      const isImgPdf = img.url_arquivo.endsWith(".pdf");
                      return (
                        <CarouselItem key={img.id} className="basis-1/2">
                          <Button
                            variant="outline"
                            className="p-1 w-full h-full flex flex-col gap-2 relative group"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              openMediaViewer(img);
                            }}
                          >
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <Expand className="h-6 w-6 text-white" />
                            </div>
                            {isImgPdf ? (
                              <div className="flex-1 flex items-center justify-center bg-muted/50 w-full h-24 rounded-t-md">
                                <FileText className="h-10 w-10 text-red-600" />
                              </div>
                            ) : (
                              <img
                                src={img.url_arquivo}
                                alt={img.nome_arquivo}
                                className="w-full h-24 object-cover rounded-t-md"
                              />
                            )}
                            <p className="text-xs text-muted-foreground truncate w-full px-1 pb-1">
                              {img.nome_arquivo}
                            </p>
                          </Button>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious type="button" className="absolute left-2" />
                  <CarouselNext type="button" className="absolute right-2" />
                </Carousel>
              )}
            </CardContent>
          </Card>
          {/* Card de Análise IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="mr-2 h-5 w-5" />
                Análise por IA
              </CardTitle>
              <CardDescription>{getAiCardDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRunAnalise();
                }}
                disabled={isAnalisePending || !selectedMedia || isPdf}
              >
                {isAnalisePending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                {isAnalisePending ? "Analisando..." : "Analisar Imagem"}
              </Button>
              <div className="p-4 bg-muted rounded-md min-h-[100px] text-sm text-muted-foreground whitespace-pre-wrap">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {isAnalisePending
                    ? "Aguardando resposta da IA..."
                    : // ATUALIZADO: Acessa a propriedade .analysis_text
                      analiseResult?.analysis_text ||
                      "A análise gerada pela IA aparecerá aqui."}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Formulário do Laudo */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Formulário do Laudo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="step2.titulo"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium">
                      Título do Laudo *
                    </label>
                    <Input placeholder="Ex: Laudo de RM Crânio" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="step2.descricao"
                render={(
                  { field, fieldState }, // Adiciona fieldState
                ) => (
                  <FormItem>
                    <label className="text-sm font-medium">
                      Achados (Descrição) *
                    </label>
                    <div
                      className={cn(
                        "rounded-md border border-input",
                        fieldState.error && "border-destructive",
                        "[&_.CodeMirror]:min-h-[150px]",
                        "[&_.CodeMirror]:border-0",
                        "[&_.editor-toolbar]:rounded-t-md [&_.editor-toolbar]:border-0 [&_.editor-toolbar]:border-b",
                        "[&_.editor-toolbar_a]:border-0",
                        "[&_.editor-toolbar_a.active]:bg-muted",
                        "[&_.editor-toolbar_a:hover]:bg-muted",
                      )}
                    >
                      <MarkdownEditor
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={onGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar (Etapa 1)
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                Salvar Laudo
              </Button>
            </CardFooter>
          </Card>
          {selectedMedia && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col justify-center items-start gap-2">
                  <CardTitle className="text-base truncate">
                    {selectedMedia.nome_arquivo}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    <strong>Observações:</strong>{" "}
                    {selectedMedia.observacoes || (
                      <span className="text-sm text-muted-foreground">
                        Nenhuma informação.
                      </span>
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeMediaViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[400px] w-full overflow-auto bg-muted/20 rounded-md border">
                {isPdf ? (
                  <iframe
                    src={selectedMedia.url_arquivo}
                    className="w-full h-full"
                    title={selectedMedia.nome_arquivo}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={selectedMedia.url_arquivo}
                      alt={selectedMedia.nome_arquivo}
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                      className="transition-transform duration-150"
                    />
                  </div>
                )}
              </CardContent>
              {!isPdf && (
                <CardFooter className="sm:justify-start">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        handleZoom("out");
                      }}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-sm text-muted-foreground">
                      {zoomLevel}%
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        handleZoom("in");
                      }}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
