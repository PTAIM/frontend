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
import { pacienteService } from "~/services/pacientes";
import { PaginatedTable } from "~/components/paginated-table";
import { useDebounce } from "~/hooks/debounce";
import { cpfMask, phoneMask } from "~/lib/utils";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;

  try {
    const pacientes = await pacienteService.readFiltered({
      page: page,
      limit: limit,
      search: search,
    });
    return { data: pacientes, search, page, limit, error: null };
  } catch (error) {
    const errorMessage = (error as Error).message;
    toast.error("Erro ao buscar pacientes.", {
      description: errorMessage,
    });
    return {
      data: { items: [], total: 0, page: 1, limit: 10 },
      search,
      page,
      limit,
      error: errorMessage,
    };
  }
}

export default function PacientesIndexPage({
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
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
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os pacientes vinculados a você.
            </p>
          </div>
          <Button asChild>
            <Link to="/pacientes/criar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Cadastrar Paciente
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            {/* Barra de Busca */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Form className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  className="pl-8"
                  name="search"
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Form>
              <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                {totalResults} {totalResults === 1 ? "paciente" : "pacientes"}{" "}
                encontrados
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
                  Não foi possível buscar a lista de pacientes. Tente recarregar
                  a página.
                </AlertDescription>
              </Alert>
            )}
            {/* Tabela Paginada */}
            <PaginatedTable
              data={data.items}
              isLoading={searching}
              page={page}
              limit={limit}
              total={data.total}
              onPageChange={handlePageChange}
              colSpan={6}
              tableHeaders={
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Nascimento</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
              }
              renderRow={(paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell>{paciente.email}</TableCell>
                  <TableCell>{cpfMask(paciente.cpf)}</TableCell>
                  <TableCell>{phoneMask(paciente.telefone)}</TableCell>
                  <TableCell>
                    {format(new Date(paciente.data_nascimento), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild type="button">
                      <Link to={`/pacientes/${paciente.id}`}>
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
