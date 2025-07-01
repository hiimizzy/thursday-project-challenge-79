
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, X, Users } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SearchFilters {
  search: string;
  status: string;
  members: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  assignee: string;
}

interface ProjectSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

const ProjectSearch = ({ filters, onFiltersChange, onClearFilters }: ProjectSearchProps) => {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.members !== 'all' || 
                          filters.dateFrom || filters.dateTo || filters.assignee !== 'all';

  return (
    <div className="space-y-4">
      {/* Busca Principal */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos, tarefas, descrições..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filtros Avançados */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="w-[120px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.members} onValueChange={(value) => updateFilter('members', value)}>
          <SelectTrigger className="w-[140px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Membros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas equipes</SelectItem>
            <SelectItem value="small">1-3 membros</SelectItem>
            <SelectItem value="medium">4-6 membros</SelectItem>
            <SelectItem value="large">7+ membros</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.assignee} onValueChange={(value) => updateFilter('assignee', value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="me">Meus projetos</SelectItem>
            <SelectItem value="team">Equipe</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Data */}
        <div className="flex gap-1">
          <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "dd/MM", { locale: ptBR }) : "De"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom || undefined}
                onSelect={(date) => {
                  updateFilter('dateFrom', date || null);
                  setIsDateFromOpen(false);
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "dd/MM", { locale: ptBR }) : "Até"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo || undefined}
                onSelect={(date) => {
                  updateFilter('dateTo', date || null);
                  setIsDateToOpen(false);
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Busca: "{filters.search}"
              <button 
                onClick={() => updateFilter('search', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <button 
                onClick={() => updateFilter('status', 'all')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="text-xs">
              De: {format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR })}
              <button 
                onClick={() => updateFilter('dateFrom', null)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSearch;
