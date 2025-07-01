import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings2, Trash2, GripVertical, CalendarIcon, Save, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { useAutoSave } from '@/hooks/useAutoSave';
import { usePermissions, UserRole } from '@/hooks/usePermissions';
import { useSocketSync } from '@/hooks/useSocketSync';

interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'status' | 'date' | 'dropdown' | 'person' | 'checkbox';
  width: number;
  options?: string[];
}

interface Item {
  id: string;
  [key: string]: any;
}

interface BoardViewProps {
  project: any;
  onUpdateProject: (updatedProject: any) => void;
}

const BoardView = ({ project, onUpdateProject }: BoardViewProps) => {
  const [columns, setColumns] = useState<Column[]>(project.columns || []);
  const [items, setItems] = useState<Item[]>(project.items || []);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<Column['type']>('text');
  const [newColumnOptions, setNewColumnOptions] = useState('');

  // Usar permissões
  const { permissions, isLoading: permissionsLoading, user } = usePermissions(project.companyId);
  const { addOptimisticAction, hasPendingActions } = useOptimisticUpdates();

  // Sincronização em tempo real com Socket.io
  const { isConnected } = useSocketSync({
    room: `project-${project.id}`,
    entityType: 'project',
    entityId: project.id,
    onUpdate: (data) => {
      console.log('📡 Projeto atualizado via Socket.io:', data);
      // Recarregar dados do projeto quando houver atualizações
      if (data.event === 'UPDATE') {
        // Atualizar estado local com dados do servidor
        if (data.data.columns) setColumns(data.data.columns);
        if (data.data.items) setItems(data.data.items);
      }
    },
    onError: (error) => {
      console.error('❌ Erro na sincronização via Socket.io:', error);
    }
  });

  // Auto-save simulado (substitua pela sua API)
  const saveProjectData = useCallback(async (data: any) => {
    if (!user) return;
    
    try {
      console.log('💾 Salvando projeto via API...', data);
      
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Projeto salvo com sucesso');
      onUpdateProject({ ...project, ...data });
      
    } catch (error) {
      console.error('❌ Erro ao salvar projeto:', error);
      throw error;
    }
  }, [project, onUpdateProject, user]);

  useAutoSave({ columns, items }, saveProjectData, 1500);

  // Verificar permissões antes de executar ações
  const addColumn = async () => {
    if (!permissions.canCreateColumns || permissionsLoading) {
      alert('Você não tem permissão para criar colunas');
      return;
    }

    if (newColumnName.trim()) {
      const newColumn: Column = {
        id: Date.now().toString(),
        name: newColumnName,
        type: newColumnType,
        width: 150,
        options: newColumnType === 'status' || newColumnType === 'dropdown' 
          ? (newColumnOptions ? newColumnOptions.split(',').map(opt => opt.trim()) : ['Opção 1', 'Opção 2', 'Opção 3'])
          : undefined
      };

      const previousColumns = [...columns];
      const updatedColumns = [...columns, newColumn];
      
      // Atualização otimista
      setColumns(updatedColumns);
      
      addOptimisticAction({
        id: `add-column-${newColumn.id}`,
        type: 'create',
        data: newColumn,
        rollback: () => setColumns(previousColumns)
      });

      await saveProjectData({ columns: updatedColumns, items });
      setNewColumnName('');
      setNewColumnType('text');
      setNewColumnOptions('');
      setShowAddColumn(false);
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (!permissions.canDeleteColumns || permissionsLoading) {
      alert('Você não tem permissão para deletar colunas');
      return;
    }

    const previousColumns = [...columns];
    const previousItems = [...items];
    const updatedColumns = columns.filter(col => col.id !== columnId);
    const updatedItems = items.map(item => {
      const { [columnId]: removed, ...rest } = item;
      return rest as Item;
    });

    // Atualização otimista
    setColumns(updatedColumns);
    setItems(updatedItems);

    addOptimisticAction({
      id: `delete-column-${columnId}`,
      type: 'delete',
      data: { columnId },
      rollback: () => {
        setColumns(previousColumns);
        setItems(previousItems);
      }
    });

    await saveProjectData({ columns: updatedColumns, items: updatedItems });
  };

  const addItem = async () => {
    if (!permissions.canEdit || permissionsLoading) {
      alert('Você não tem permissão para adicionar itens');
      return;
    }

    const newItem: Item = {
      id: Date.now().toString(),
      [columns[0]?.id || '1']: `Item ${items.length + 1}`,
      created_by: user?.id,
      created_at: new Date().toISOString()
    };

    const previousItems = [...items];
    const updatedItems = [...items, newItem];
    
    // Atualização otimista
    setItems(updatedItems);
    
    addOptimisticAction({
      id: `add-item-${newItem.id}`,
      type: 'create',
      data: newItem,
      rollback: () => setItems(previousItems)
    });

    await saveProjectData({ columns, items: updatedItems });
  };

  const updateItem = async (itemId: string, columnId: string, value: any) => {
    if (!permissions.canEdit || permissionsLoading) {
      return;
    }

    const previousItems = [...items];
    const updatedItems = items.map(item => 
      item.id === itemId ? { 
        ...item, 
        [columnId]: value,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      } : item
    );
    
    // Atualização otimista
    setItems(updatedItems);
    
    addOptimisticAction({
      id: `update-item-${itemId}-${columnId}`,
      type: 'update',
      data: { itemId, columnId, value },
      rollback: () => setItems(previousItems)
    });

    // Salvar com debounce através do useAutoSave
  };

  const deleteItem = async (itemId: string) => {
    if (!permissions.canDelete || permissionsLoading) {
      alert('Você não tem permissão para deletar itens');
      return;
    }

    const previousItems = [...items];
    const updatedItems = items.filter(item => item.id !== itemId);
    
    // Atualização otimista
    setItems(updatedItems);
    
    addOptimisticAction({
      id: `delete-item-${itemId}`,
      type: 'delete',
      data: { itemId },
      rollback: () => setItems(previousItems)
    });

    await saveProjectData({ columns, items: updatedItems });
  };

  const updateProject = (updates: any) => {
    const updatedProject = { ...project, ...updates };
    onUpdateProject(updatedProject);
  };

  // Renderizar conteúdo da célula com base no tipo da coluna
  const renderCellContent = (item: Item, column: Column) => {
    const value = item[column.id];

    if (!permissions.canEdit) {
      // Modo somente leitura
      switch (column.type) {
        case 'date':
          return <span className="text-sm">{value ? format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</span>;
        case 'checkbox':
          return <Checkbox checked={value || false} disabled />;
        case 'status':
        case 'dropdown':
          return value ? <Badge variant="outline">{value}</Badge> : <span className="text-gray-400">-</span>;
        default:
          return <span className="text-sm">{value || '-'}</span>;
      }
    }

    // Modo editável
    switch (column.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateItem(item.id, column.id, e.target.value)}
            className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-200"
            placeholder="Digite aqui..."
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateItem(item.id, column.id, e.target.value)}
            className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-200"
            placeholder="0"
          />
        );
      
      case 'status':
        return (
          <Select value={value || ''} onValueChange={(newValue) => updateItem(item.id, column.id, newValue)}>
            <SelectTrigger className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-200">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  <Badge variant="outline">{option}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'dropdown':
        return (
          <Select value={value || ''} onValueChange={(newValue) => updateItem(item.id, column.id, newValue)}>
            <SelectTrigger className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-200">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="justify-start font-normal border-0 bg-transparent hover:bg-gray-50">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => updateItem(item.id, column.id, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      
      case 'person':
        return (
          <Select value={value || ''} onValueChange={(newValue) => updateItem(item.id, column.id, newValue)}>
            <SelectTrigger className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-200">
              <SelectValue placeholder="Atribuir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">João Silva</SelectItem>
              <SelectItem value="user2">Maria Santos</SelectItem>
              <SelectItem value="user3">Pedro Costa</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={(checked) => updateItem(item.id, column.id, checked)}
          />
        );
      
      default:
        return <span>{value}</span>;
    }
  };

  if (permissionsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando permissões...</span>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header com status de sync */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">{project.name}</h2>
            {hasPendingActions ? (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Save className="h-3 w-3 animate-pulse" />
                Salvando...
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="h-3 w-3" />
                Socket.io Conectado
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <WifiOff className="h-3 w-3" />
                Socket.io Desconectado
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600">{project.description}</p>
          <p className="text-xs text-gray-500">
            Permissões: {permissions.canEdit ? 'Editor' : 'Visualizador'} • 
            {permissions.canDelete ? ' Pode deletar' : ' Somente leitura'} •
            Usuário: {user?.email}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {permissions.canEdit && (
            <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          )}
          
          {permissions.canCreateColumns && (
            <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Coluna
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Coluna</DialogTitle>
                  <DialogDescription>
                    Configure o nome, tipo e opções da nova coluna
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Coluna</label>
                    <Input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Digite o nome da coluna..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo da Coluna</label>
                    <Select value={newColumnType} onValueChange={(value: Column['type']) => setNewColumnType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">📄 Texto</SelectItem>
                        <SelectItem value="number">🔢 Número</SelectItem>
                        <SelectItem value="status">🏷️ Status</SelectItem>
                        <SelectItem value="date">📅 Data</SelectItem>
                        <SelectItem value="dropdown">📋 Lista Suspensa</SelectItem>
                        <SelectItem value="person">👤 Pessoa</SelectItem>
                        <SelectItem value="checkbox">☑️ Caixa de Seleção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(newColumnType === 'status' || newColumnType === 'dropdown') && (
                    <div>
                      <label className="text-sm font-medium">Opções (separadas por vírgula)</label>
                      <Input
                        value={newColumnOptions}
                        onChange={(e) => setNewColumnOptions(e.target.value)}
                        placeholder="Opção 1, Opção 2, Opção 3..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Deixe em branco para usar opções padrão
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={addColumn} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!newColumnName.trim()}
                  >
                    Adicionar Coluna
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabela responsiva */}
      <div className="border rounded-lg overflow-auto max-w-full">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-8 sm:w-12"></TableHead>
                {columns.map((column) => (
                  <TableHead key={column.id} style={{ minWidth: column.width, width: column.width }}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs sm:text-sm">{column.name}</span>
                      <div className="flex items-center gap-1">
                        <Settings2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        {permissions.canDeleteColumns && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteColumn(column.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableHead>
                ))}
                {permissions.canDelete && <TableHead className="w-8 sm:w-12"></TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className={index % 2 === 0 ? 'bg-black-50/50' : 'bg-gray-50/50'}>

                  <TableCell className="p-2">
                    <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-white-400 cursor-move bg-gray" />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.id} className="p-2">
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                  {permissions.canDelete && (
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Estado vazio */}
      {items.length === 0 && (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <p className="mb-4 text-sm sm:text-base">Nenhum item criado ainda</p>
          {permissions.canEdit && (
            <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Item
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardView;
