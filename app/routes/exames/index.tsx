import { useState, useEffect } from "react";
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
import { Badge } from "../../components/ui/badge";
import type { Route } from "./+types";
import { exameService } from "~/services/exames";
import { PaginatedTable } from "~/components/paginated-table";
import { useDebounce } from "~/hooks/debounce";
import type { ExamesParams } from "~/types/exame";
import { usePermissions } from "~/hooks/use-permissions";
import { FilterBar, type FilterState } from "~/components/filter-bar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Exames - MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const data_inicio = url.searchParams.get("data_inicio") || "";
  const data_fim = url.searchParams.get("data_fim") || "";

  const params: ExamesParams = {
    search: search,
    page: page,
    limit: limit,
    data_inicio: data_inicio,
    data_fim: data_fim,
  };

  try {
    const exames = await exameService.readAll(params);
    return {
      data: exames,
      search,
      data_inicio,
      data_fim,
      page,
      limit,
      error: null,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao buscar exames.", {
      description: errorMessage,
    });
    return {
      data: { items: [], total: 0, page: 1, limit: 10 },
      search,
      data_inicio,
      data_fim,
      page,
      limit,
      error: errorMessage,
    };
  }
}

export default function ExamesIndexPage({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const { can } = usePermissions();
  const [searchParams] = useSearchParams();
  const { data, search, data_inicio, data_fim, page, limit, error } =
    loaderData;

  const [filters, setFilters] = useState<FilterState>({
    search: search,
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

  const reloadData = () => {
    submit(searchParams, { replace: true });
  };

  async function deletarExame(exameId: number) {
    if (
      !confirm(
        "Tem certeza que deseja deletar este exame? Essa ação não pode ser desfeita e só terá exito se não houver laudo associado a esse exame",
      )
    ) {
      return;
    }

    try {
      await exameService.delete(exameId);
      toast.success("Exame deletado com sucesso!");
      reloadData();
    } catch (error) {
      toast.error("Erro ao excluir exame", {
        description: (error as Error).message,
      });
    }
  }

  const totalResults = data?.total || 0;

  return (
    <section>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Exames</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os exames.
            </p>
          </div>
          {can("create", "exames") && (
            <Button asChild>
              <Link to="/exames/upload">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Upload de Exame
              </Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Form className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código de solicitação ou paciente..."
                  className="pl-8"
                  name="search"
                  type="search"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </Form>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  config={{
                    showDateRange: true,
                  }}
                />

                <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                  {totalResults}{" "}
                  {totalResults === 1 ? "solicitação" : "solicitações"}{" "}
                  encontradas
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Erro ao Carregar</AlertTitle>
                <AlertDescription>
                  Não foi possível buscar a lista de exames. Tente recarregar a
                  página.
                </AlertDescription>
              </Alert>
            )}
            <PaginatedTable
              data={data.items}
              isLoading={searching}
              page={page}
              limit={limit}
              total={data.total}
              onPageChange={handlePageChange}
              colSpan={7}
              tableHeaders={
                <TableHeader>
                  <TableRow>
                    <TableHead>Cód. Solicitação</TableHead>
                    <TableHead>Nome Exame</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Laboratório</TableHead>
                    <TableHead>Realização</TableHead>
                    <TableHead>Laudo</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
              }
              renderRow={(exame) => (
                <TableRow key={exame.id}>
                  <TableCell className="font-medium">
                    {exame.codigo_solicitacao}
                  </TableCell>
                  <TableCell>{exame.nome_exame}</TableCell>
                  <TableCell>{exame.paciente_nome || "N/A"}</TableCell>
                  <TableCell>{exame.nome_laboratorio}</TableCell>
                  <TableCell>
                    {format(new Date(exame.data_realizacao), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={"secondary"}
                      className={
                        exame.tem_laudo
                          ? "bg-green-300 hover:bg-green-300/80"
                          : "bg-[#FEF9C3] hover:bg-[#FEF9C3]/80"
                      }
                    >
                      {exame.tem_laudo ? "Laudado" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center justify-center mx-auto">
                      {can("read", "exames") && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/exames/${exame.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {can("delete", "exames") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            deletarExame(exame.id);
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
