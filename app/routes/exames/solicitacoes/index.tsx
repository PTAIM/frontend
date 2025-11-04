import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import { format } from "date-fns";
import { toast } from "sonner";
import { Eye, PlusCircle, Search, Terminal, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";

import type { Route } from "./+types";
import { solicitacaoService } from "~/services/solicitacoes";
import { PaginatedTable } from "~/components/paginated-table";
import { useDebounce } from "~/hooks/debounce";
import { usePermissions } from "~/hooks/use-permissions";
import { Badge } from "~/components/ui/badge";
import { SolicitacaoStatus } from "~/types/solicitacao";

import { FilterBar, type FilterState } from "~/components/filter-bar";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const status =
    (url.searchParams.get("status") as SolicitacaoStatus) || undefined;
  const data_inicio = url.searchParams.get("data_inicio") || "";
  const data_fim = url.searchParams.get("data_fim") || "";

  try {
    const solicitacoes = await solicitacaoService.readAll({
      page,
      limit,
      search,
      data_inicio,
      data_fim,
      status,
    });
    return {
      data: solicitacoes,
      search,
      status,
      data_inicio,
      data_fim,
      page,
      limit,
      error: null,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao buscar solicitações.", {
      description: errorMessage,
    });
    return {
      data: { solicitacoes: [], total: 0, page: 1, limit: 10 },
      search,
      page,
      limit,
      data_inicio,
      data_fim,
      status,
      error: errorMessage,
    };
  }
}

export default function SolicitacoesIndexPage({
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const { can } = usePermissions();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const { data, search, page, limit, data_inicio, data_fim, status, error } =
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

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    submit(newParams, { replace: true });
  };

  const totalResults = data?.total || 0;

  const statusOptions = [
    { value: SolicitacaoStatus.aguardando, label: "Aguardando" },
    { value: SolicitacaoStatus.enviado, label: "Enviado" },
    { value: SolicitacaoStatus.cancelado, label: "Cancelado" },
  ];

  return (
    <section>
      <div className="container mx-auto py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Solicitações de Exame
            </h2>
            <p className="text-muted-foreground">
              Visualize e gerencie as solicitações.
            </p>
          </div>
          {can("create", "solicitacoes") && (
            <Button asChild>
              <Link to="/exames/solicitacoes/criar">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            {/* Barra de Busca */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Form className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, exame ou prioridade..."
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
            {/* Mensagem de Erro */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Erro ao Carregar</AlertTitle>
                <AlertDescription>
                  Não foi possível buscar a lista de solicitações. Tente
                  recarregar a página.
                </AlertDescription>
              </Alert>
            )}

            {/* Tabela Paginada */}
            <PaginatedTable
              data={data.solicitacoes}
              isLoading={searching}
              page={page}
              limit={limit}
              total={data.total}
              onPageChange={handlePageChange}
              colSpan={6}
              tableHeaders={
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Exame</TableHead>
                    <TableHead>Data</TableHead>
                    {can("create", "solicitacoes") ? (
                      <TableHead>Status</TableHead>
                    ) : (
                      <TableHead>Código</TableHead>
                    )}
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
              }
              renderRow={(solicitacao: any) => (
                <TableRow key={solicitacao.id}>
                  <TableCell className="font-medium">
                    {solicitacao.paciente?.nome ??
                      solicitacao.paciente_nome ??
                      "-"}
                  </TableCell>

                  <TableCell>{solicitacao.nome_exame}</TableCell>
                  <TableCell>
                    {format(
                      new Date(solicitacao.data_solicitacao),
                      "dd/MM/yyyy",
                    )}
                  </TableCell>
                  {can("create", "solicitacoes") ? (
                    <TableCell>
                      <Badge
                        variant={"secondary"}
                        className={
                          solicitacao.status === SolicitacaoStatus.enviado
                            ? "bg-green-300 hover:bg-green-300/80"
                            : "bg-[#FEF9C3] hover:bg-[#FEF9C3]/80"
                        }
                      >
                        {solicitacao.status.replace("_", " ").toLowerCase()}
                      </Badge>
                    </TableCell>
                  ) : (
                    <TableCell>{solicitacao.codigo_solicitacao}</TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-row items-center justify-center mx-auto">
                      {can("read", "solicitacoes") && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/exames/solicitacoes/${solicitacao.id}`}>
                            <Eye className="h-4 w-4" />
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
