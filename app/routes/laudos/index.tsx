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
import { Eye, PlusCircle, Search, Terminal } from "lucide-react";

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
import type { LaudosParams } from "~/types/laudo";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;

  // Inspirado no exemplo: cria um objeto de parâmetros tipado
  const params: LaudosParams = {
    page,
    limit,
    search,
  };

  try {
    const laudos = await laudoService.readAll(params);
    // A resposta do serviço (laudos) já deve ter o formato { laudos: [], total: 0 }
    return { data: laudos, search, page, limit, error: null };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao buscar laudos.", {
      description: errorMessage,
    });
    // Retorna uma estrutura segura e vazia em caso de erro
    return {
      data: { laudos: [], total: 0 },
      search,
      page,
      limit,
      error: errorMessage,
    };
  }
}

export default function LaudosIndexPage({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  
  // Fallback para garantir que 'data' nunca seja nulo, evitando o erro
  const { data, search, page, limit, error } = loaderData || {
    data: { laudos: [], total: 0 },
    search: "",
    page: 1,
    limit: 10,
    error: "Erro inesperado ao carregar dados.",
  };

  const [searchValue, setSearchValue] = useState(search || "");
  const debouncedSearch = useDebounce(searchValue, 500);
  const searching = navigation.state === "loading";

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (currentSearch === debouncedSearch) return;

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
            <h2 className="text-3xl font-bold tracking-tight">Laudos</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os laudos criados.
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
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Form>
              <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                {totalResults} {totalResults === 1 ? "laudo" : "laudos"} encontrados
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Erro ao Carregar</AlertTitle>
                <AlertDescription>
                  Não foi possível buscar a lista de laudos. Tente recarregar a página.
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
                  <TableCell className="capitalize">{laudo.status ?? "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/laudos/${laudo.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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