import React from "react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";

function PaginatedTableSkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface PaginatedTableProps<T> {
  isLoading: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  tableHeaders: React.ReactNode;
  renderRow: (item: T) => React.ReactNode;
  noResultsMessage?: string;
  colSpan: number;
}

export function PaginatedTable<T>({
  isLoading,
  data,
  page,
  limit,
  total,
  onPageChange,
  tableHeaders,
  renderRow,
  noResultsMessage = "Nenhum resultado encontrado.",
  colSpan,
}: PaginatedTableProps<T>) {
  // Calcula o total de páginas
  const pageCount = Math.ceil(total / limit) || 1;

  return (
    <>
      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          {tableHeaders}

          <TableBody>
            {isLoading ? (
              <PaginatedTableSkeletonRows />
            ) : data.length > 0 ? (
              data.map(renderRow)
            ) : (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="h-24 text-center text-muted-foreground"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-end space-x-2 pt-4">
        <span className="text-sm text-muted-foreground">
          Página {page} de {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount || isLoading}
        >
          Próxima
        </Button>
      </div>
    </>
  );
}
