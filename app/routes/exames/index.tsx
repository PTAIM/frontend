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

  const params: ExamesParams = {
    page: page,
    limit: limit,
  };

  try {
    const exames = await exameService.readAll(params);
    return { data: exames, search, page, limit, error: null };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao buscar exames.", {
      description: errorMessage,
    });
    return {
      data: { exames: [], total: 0, page: 1, limit: 10 },
      search,
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
  const { data, search, page, limit, error } = loaderData;

  const [searchValue, setSearchValue] = useState(search || "");
  const debouncedSearch = useDebounce(searchValue, 500);
  const searching = navigation.state == "loading";

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";

    if (currentSearch === debouncedSearch) {
      return;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    if (debouncedSearch) {
      newParams.set("search", debouncedSearch);
    } else {
      newParams.delete("search");
    }

    submit(newParams, { replace: true });
  }, [debouncedSearch, submit, searchParams]);

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    submit(newParams, { replace: true });
  };

  const totalResults = data?.total || 0;

  return (
    <section>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Exames</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os exames cadastrados.
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
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Form>
              <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                {totalResults} {totalResults === 1 ? "exame" : "exames"}{" "}
                encontrados
              </span>
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
              data={data.exames}
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
                      variant={exame.tem_laudo ? "default" : "secondary"}
                      className={
                        exame.tem_laudo
                          ? "bg-green-500 hover:bg-green-500/80"
                          : "bg-yellow-500 hover:bg-yellow-500/80"
                      }
                    >
                      {exame.tem_laudo ? "Laudado" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center justify-center mx-auto">
                      {can("read", "exames") && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/exames/resultados/${exame.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {can("delete", "exames") && (
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

