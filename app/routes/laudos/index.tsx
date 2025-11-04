import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useFetcher,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CheckCircle,
  Eye,
  Pencil,
  PlusCircle,
  Search,
  Terminal,
  Trash2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

import type { Route } from "./+types";
import { PaginatedTable } from "~/components/paginated-table";
import { useDebounce } from "~/hooks/debounce";
import { laudoService } from "~/services/laudos";
import { LaudoStatus, type LaudosParams } from "~/types/laudo";
import { usePermissions } from "~/hooks/use-permissions";
import { FilterBar, type FilterState } from "~/components/filter-bar";
import { Badge } from "~/components/ui/badge";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const status = (url.searchParams.get("status") as LaudoStatus) || undefined;
  const data_inicio = url.searchParams.get("data_inicio") || "";
  const data_fim = url.searchParams.get("data_fim") || "";

  const params: LaudosParams = {
    page,
    limit,
    search,
    status,
    data_inicio,
    data_fim,
  };

  try {
    const laudos = await laudoService.readAll(params);
    return {
      data: laudos,
      search,
      page,
      status,
      data_inicio,
      data_fim,
      limit,
      error: null,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao buscar laudos.", {
      description: errorMessage,
    });
    return {
      data: { laudos: [], total: 0 },
      search,
      page,
      limit,
      status,
      data_inicio,
      data_fim,
      error: errorMessage,
    };
  }
}

export default function LaudosIndexPage({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const { can } = usePermissions();
  const fetcher = useFetcher();

  const { data, search, status, data_inicio, data_fim, page, limit, error } =
    loaderData;

  const [filters, setFilters] = useState<FilterState>({
    search: search,
    status: status,
    data_inicio: data_inicio,
    data_fim: data_fim,
  });
  const debouncedFilters = useDebounce(filters, 500);
  const searching = navigation.state === "loading";

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1"); // Sempre reseta para a página 1 ao filtrar

    let hasChanged = false;

    const updateParam = (key: string, value: string) => {
      const currentValue = currentParams.get(key) || "";
      if (currentValue !== value) {
        hasChanged = true;
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }
    };

    updateParam("search", debouncedFilters.search ?? "");
    updateParam("status", debouncedFilters.status ?? "");
    updateParam("data_inicio", debouncedFilters.data_inicio ?? "");
    updateParam("data_fim", debouncedFilters.data_fim ?? "");

    if (hasChanged) {
      submit(newParams, { replace: true });
    }
  }, [debouncedFilters, submit, searchParams]);

  const reloadData = () => {
    submit(searchParams, { replace: true });
  };

  async function finalizarLaudo(laudoId: number) {
    if (
      !confirm(
        "Tem certeza que deseja finalizar este laudo? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }
    try {
      await laudoService.updateStatus(laudoId);
      reloadData();
    } catch (error) {
      toast.error("Erro ao finalizar laudo", {
        description: (error as Error).message,
      });
    }
  }

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    submit(newParams, { replace: true });
  };

  const totalResults = data?.total || 0;

  const statusOptions = [
    { value: LaudoStatus.rascunho, label: "Rascunho" },
    {
      value: LaudoStatus.finalizado,
      label: "Finalizado",
    },
  ];

  return (
    <section>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Laudos</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os laudos.
            </p>
          </div>
          <Button asChild>
            <Link to="/laudos/criar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Laudo
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Form className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente ou título..."
                  className="pl-8"
                  name="search"
                  type="search"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </Form>

              <FilterBar
                filters={filters}
                setFilters={setFilters}
                config={{
                  showStatus: true,
                  showDateRange: true,
                }}
                statusOptions={statusOptions}
              />

              <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                {totalResults}{" "}
                {totalResults === 1 ? "solicitação" : "solicitações"}{" "}
                encontradas
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Erro ao Carregar</AlertTitle>
                <AlertDescription>
                  Não foi possível buscar a lista de laudos. Tente recarregar a
                  página.
                </AlertDescription>
              </Alert>
            )}

            <PaginatedTable
              data={data?.laudos || []}
              isLoading={searching}
              page={page}
              limit={limit}
              total={totalResults}
              onPageChange={handlePageChange}
              colSpan={5}
              tableHeaders={
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
              }
              renderRow={(laudo) => (
                <TableRow key={laudo.id}>
                  <TableCell className="font-medium">{laudo.titulo}</TableCell>
                  <TableCell>{laudo.paciente_nome ?? "-"}</TableCell>
                  <TableCell>
                    {laudo.data_emissao
                      ? format(new Date(laudo.data_emissao), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={"secondary"}
                      className={
                        laudo.status === LaudoStatus.finalizado
                          ? "bg-green-300 hover:bg-green-300/80"
                          : "bg-[#FEF9C3] hover:bg-[#FEF9C3]/80"
                      }
                    >
                      {laudo.status.replace("_", " ").toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center justify-center mx-auto">
                      {can("update", "solicitacoes") && // Use a permissão apropriada
                        laudo.status === LaudoStatus.rascunho && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Finalizar Laudo"
                            onClick={() => {
                              finalizarLaudo(laudo.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      {can("read", "solicitacoes") && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/laudos/${laudo.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {can("update", "solicitacoes") &&
                        laudo.status === LaudoStatus.rascunho && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/laudos/atualizar/${laudo.id}`}>
                              <Pencil className="h-4 w-4 text-primary" />
                            </Link>
                          </Button>
                        )}
                      {can("delete", "solicitacoes") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            console.log("deletando solicitacoes...");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
