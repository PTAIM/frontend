import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { cn } from "~/lib/utils";

export type FilterState = {
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  [key: string]: any;
};

type StatusOption = {
  value: string;
  label: string;
};

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  config: {
    showStatus?: boolean;
    showDateRange?: boolean;
  };
  statusOptions?: StatusOption[];
}

export function FilterBar({
  filters,
  setFilters,
  config,
  statusOptions = [],
}: FilterBarProps) {
  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
  };

  const handleStatusChange = (value: string) => {
    handleFilterChange("status", value === "todos" ? undefined : value);
  };

  const handleDateChange = (
    key: "data_inicio" | "data_fim",
    date: Date | undefined,
  ) => {
    handleFilterChange(key, date ? format(date, "yyyy-MM-dd") : undefined);
  };

  // Função para converter a string 'yyyy-MM-dd' de volta para um Date
  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString + "T00:00:00");
  };

  return (
    <>
      {/* --- Filtro de Status  --- */}
      {config.showStatus && (
        <Select
          value={filters.status || "todos"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* --- Filtros de Data  --- */}
      {config.showDateRange && (
        <>
          {/* Data Início */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[180px] justify-start text-left font-normal",
                  !filters.data_inicio && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.data_inicio ? (
                  format(parseDate(filters.data_inicio)!, "dd/MM/yyyy")
                ) : (
                  <span>Data Início</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={parseDate(filters.data_inicio)}
                onSelect={(date) => handleDateChange("data_inicio", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Data Fim */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[180px] justify-start text-left font-normal",
                  !filters.data_fim && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.data_fim ? (
                  format(parseDate(filters.data_fim)!, "dd/MM/yyyy")
                ) : (
                  <span>Data Fim</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={parseDate(filters.data_fim)}
                onSelect={(date) => handleDateChange("data_fim", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </>
  );
}
