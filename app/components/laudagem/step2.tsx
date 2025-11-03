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
} from "lucide-react";

import { FormField, FormItem } from "~/components/ui/form";
import type { CreateLaudoForm } from "~/schemas/laudo";
import React, { Suspense, useMemo, useState } from "react";

const SimpleMDEEditor = React.lazy(() => import("react-simplemde-editor"));
import "easymde/dist/easymde.min.css";
import { cn } from "~/lib/utils";

interface ImagemExame {
  id: number;
  url: string;
  descricao: string;
}

const useImagensPorExames = (exameIds: number[]) => {
  return useQuery({
    queryKey: ["imagensPorExames", exameIds],
    queryFn: async () => {
      if (exameIds.length === 0) return [];
      console.log(`Buscando imagens para exames IDs: ${exameIds.join(", ")}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          url: "https://cdn.pixabay.com/photo/2012/10/26/00/26/computer-tomography-62942_960_720.jpg",
          descricao: "Exame 101 - Imagem 1",
        },
        {
          id: 2,
          url: "https://placehold.co/800x600/000000/FFF?text=Imagem+2",
          descricao: "Exame 101 - Imagem 2",
        },
        {
          id: 3,
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          descricao: "Exame 102 - Laudo (PDF)",
        },
      ];
    },
    enabled: exameIds.length > 0,
    staleTime: Infinity,
  });
};

const useAnaliseIA = () => {
  return useMutation<string, Error, { exameIds: number[] }>({
    mutationFn: async ({ exameIds }) => {
      console.log(
        `Enviando exames IDs ${exameIds.join(", ")} para análise de IA...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula delay da IA
      // Resposta mockada
      return "Análise da IA:\n\n- Detectada leve assimetria no ventrículo esquerdo.\n- Nenhuma anomalia significativa encontrada no tórax.\n- Recomenda-se acompanhamento clínico.";
    },
    onSuccess: () => {
      toast.success("Análise de IA concluída com sucesso!");
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

  const [selectedMedia, setSelectedMedia] = useState<ImagemExame | null>(null);
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
    runAnaliseIA({ exameIds: selectedExameIds || [] });
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      let newZoom = direction === "in" ? prev + 25 : prev - 25;
      if (newZoom < 50) newZoom = 50; // Limite mínimo de zoom
      if (newZoom > 300) newZoom = 300; // Limite máximo
      return newZoom;
    });
  };

  const isPdf = selectedMedia?.url.endsWith(".pdf");

  const openMediaViewer = (media: ImagemExame) => {
    setZoomLevel(100); // Reseta o zoom
    setSelectedMedia(media);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
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
                      const isImgPdf = img.url.endsWith(".pdf");
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
                                src={img.url}
                                alt={img.descricao}
                                className="w-full h-24 object-cover rounded-t-md"
                              />
                            )}
                            <p className="text-xs text-muted-foreground truncate w-full px-1 pb-1">
                              {img.descricao}
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
              <CardDescription>
                Use a IA como assistente para pré-análise.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRunAnalise();
                }}
                disabled={
                  isAnalisePending || (selectedExameIds || []).length === 0
                }
              >
                {isAnalisePending ? (
                  "Analisando..."
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analisar Imagens
                  </>
                )}
              </Button>
              <div className="p-4 bg-muted rounded-md min-h-[100px] text-sm text-muted-foreground whitespace-pre-wrap">
                {isAnalisePending
                  ? "Aguardando resposta da IA..."
                  : analiseResult || "A análise gerada pela IA aparecerá aqui."}
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
                <CardTitle className="text-base truncate">
                  {selectedMedia.descricao}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={closeMediaViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[400px] w-full overflow-auto bg-muted/20 rounded-md border">
                {isPdf ? (
                  <iframe
                    src={selectedMedia.url}
                    className="w-full h-full"
                    title={selectedMedia.descricao}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.descricao}
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
