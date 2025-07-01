
import { useState, useEffect, useCallback } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  MoreVertical,
  Star,
  StarOff,
  Eye,
  Edit,
  Trash2,
  Building,
  FolderKanban,
  CircleHelp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CreateProjectDialog from '@/components/CreateProjectDialog';
import InviteMembersDialog from '@/components/InviteMembersDialog';
import ProjectSearch from '@/components/ProjectSearch';
import { useSocketSync } from '@/hooks/useSocketSync';
import { usePermissions } from '@/hooks/usePermissions';
import { initializeSocket, getSocket, socketEvents } from '@/lib/socket';
import ThemeToggle from '@/components/ThemeToggle';
import HelpDialog from '@/components/HelpDialog';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  members: number;
  tasks: number;
  completedTasks: number;
  dueDate: string;
  favorite: boolean;
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
}

interface SearchFilters {
  search: string;
  status: string;
  members: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  assignee: string;
}

// Mock data para demonstração
const mockCompanies: Company[] = [
  { id: 'company-1', name: 'Empresa Demo', role: 'admin' }
];

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Projeto Exemplo',
    description: 'Um projeto de demonstração',
    status: 'active',
    members: 3,
    tasks: 10,
    completedTasks: 7,
    dueDate: new Date().toISOString(),
    favorite: false,
    companyId: 'company-1'
  }
];

const Dashboard = () => {
  const [allProjects, setAllProjects] = useState<Project[]>(mockProjects);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(mockCompanies[0]);
  const [profileImage, setProfileImage] = useState('');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    status: 'all',
    members: 'all',
    dateFrom: null,
    dateTo: null,
    assignee: 'all'
  });
  
  const { toast } = useToast();
  
  // Usar permissões
  const { permissions, user } = usePermissions(currentCompany?.id || '');
  
  // Sincronização em tempo real com Socket.io
  const { isConnected } = useSocketSync({
    room: `company-${currentCompany?.id}`,
    entityType: 'company',
    entityId: currentCompany?.id || '',
    onUpdate: (data) => {
      console.log('📡 Empresa atualizada via Socket.io:', data);
      // Recarregar projetos quando houver atualizações
      if (data.event === 'UPDATE' || data.event === 'INSERT') {
        loadProjects();
      }
    },
    onError: (error) => {
      console.error('❌ Erro na sincronização via Socket.io:', error);
    }
  });

  // Inicializar Socket.io
  useEffect(() => {
    const socket = initializeSocket();
    console.log('🔗 Socket.io inicializado no Dashboard');
    
    return () => {
      console.log('🔌 Limpando conexão Socket.io do Dashboard');
    };
  }, []);

  // Carregar projetos da empresa atual
  const loadProjects = useCallback(async () => {
    if (!currentCompany || !user) return;

    try {
      // Aqui você faria uma chamada para sua API
      // const response = await fetch(`/api/projects?companyId=${currentCompany.id}`);
      // const projectsData = await response.json();
      
      // Por enquanto, usando dados mock
      console.log('📂 Carregando projetos da empresa:', currentCompany.name);
      setAllProjects(mockProjects);
      
    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
    }
  }, [currentCompany, user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Filtrar projetos pela empresa atual
  const projects = allProjects.filter(project => project.companyId === currentCompany?.id);

  const handleCreateProject = async (newProject: Project) => {
    if (!permissions.canEdit || !currentCompany || !user) {
      toast({
        title: "❌ Sem permissão",
        description: "Você não tem permissão para criar projetos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simular chamada para API
      const projectData = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        companyId: currentCompany.id,
        status: 'active' as const,
        members: 1,
        tasks: 0,
        completedTasks: 0,
        dueDate: newProject.dueDate,
        favorite: false
      };

      // Atualizar lista local
      setAllProjects(prev => [projectData, ...prev]);
      
      // Emitir evento via Socket.io
      const socket = getSocket();
      if (socket) {
        socket.emit(socketEvents.PROJECT_CREATED, {
          project: projectData,
          companyId: currentCompany.id,
          user: user.name || user.email
        });
      }
      
      toast({
        title: "✅ Projeto criado!",
        description: `${newProject.name} foi criado com sucesso.`,
      });

    } catch (error) {
      console.error('❌ Erro ao criar projeto:', error);
      toast({
        title: "❌ Erro ao criar projeto",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (projectId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    if (!project || !permissions.canEdit) return;

    // Atualização otimista
    setAllProjects(allProjects.map(project => 
      project.id === projectId 
        ? { ...project, favorite: !project.favorite }
        : project
    ));

    try {
      // Simular chamada para API
      console.log('⭐ Alternando favorito do projeto:', projectId);
      
      // Emitir evento via Socket.io
      const socket = getSocket();
      if (socket) {
        socket.emit(socketEvents.PROJECT_UPDATED, {
          projectId,
          favorite: !project.favorite,
          user: user.name || user.email
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar favorito:', error);
      // Reverter mudança em caso de erro
      setAllProjects(allProjects.map(project => 
        project.id === projectId 
          ? { ...project, favorite: project.favorite }
          : project
      ));
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!permissions.canDelete) {
      toast({
        title: "❌ Sem permissão",
        description: "Você não tem permissão para deletar projetos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simular chamada para API
      console.log('🗑️ Deletando projeto:', projectId);
      
      setAllProjects(allProjects.filter(project => project.id !== projectId));
      
      // Emitir evento via Socket.io
      const socket = getSocket();
      if (socket) {
        socket.emit(socketEvents.PROJECT_DELETED, {
          projectId,
          user: user.name || user.email
        });
      }
      
      toast({
        title: "✅ Projeto excluído",
        description: "O projeto foi excluído com sucesso.",
      });

    } catch (error) {
      console.error('❌ Erro ao deletar projeto:', error);
      toast({
        title: "❌ Erro ao deletar projeto",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  };

  const handleCreateCompany = (name: string) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      name,
      role: 'admin'
    };
    setCompanies([...companies, newCompany]);
    setCurrentCompany(newCompany);
    toast({
      title: "Empresa criada!",
      description: `${name} foi criada com sucesso.`,
    });
  };

  const handleCompanyChange = (company: Company) => {
    setCurrentCompany(company);
    toast({
      title: "Empresa alterada",
      description: `Agora você está trabalhando em ${company.name}.`,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      members: 'all',
      dateFrom: null,
      dateTo: null,
      assignee: 'all'
    });
  };

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         project.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || project.status === filters.status;
    
    const matchesMembers = filters.members === 'all' || 
                          (filters.members === 'small' && project.members <= 3) ||
                          (filters.members === 'medium' && project.members > 3 && project.members <= 6) ||
                          (filters.members === 'large' && project.members > 6);
    
    const matchesAssignee = filters.assignee === 'all';
    
    let matchesDate = true;
    if (filters.dateFrom || filters.dateTo) {
      const projectDate = new Date(project.dueDate);
      if (filters.dateFrom && projectDate < filters.dateFrom) matchesDate = false;
      if (filters.dateTo && projectDate > filters.dateTo) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesMembers && matchesAssignee && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-300">Nenhuma empresa encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          currentCompany={currentCompany}
          profileImage={profileImage}
          onProfileImageChange={setProfileImage}
          projects={projects}
          onCreateProject={handleCreateProject}
          companies={companies}
          onCompanyChange={handleCompanyChange}
          onCreateCompany={handleCreateCompany}
        />
        
        <SidebarInset className="flex-1">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4 md:hidden">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Building className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <h1 className="text-base font-semibold truncate">{currentCompany.name}</h1>
              {isConnected && <div className="h-2 w-2 bg-green-500 rounded-full" title="Socket.io Conectado" />}
            </div>
            <div className="flex gap-1">
              <ThemeToggle />
              <HelpDialog trigger={
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <CircleHelp className="h-4 w-4" />
                </Button>
              } />
              <Button onClick={() => setIsInviteOpen(true)} variant="outline" size="sm" className="h-8 w-8 p-0">
                <Users className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsCreateProjectOpen(true)} size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header Desktop */}
            <div className="hidden md:flex md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
                  {isConnected && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      Socket.io
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Gerencie seus projetos em {currentCompany.name}
                </p>
              </div>
              <div className="flex gap-2">
                <ThemeToggle />
                <HelpDialog />
                <Button onClick={() => setIsInviteOpen(true)} variant="outline" className="hidden lg:flex">
                  <Users className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
                <Button onClick={() => setIsInviteOpen(true)} variant="outline" className="lg:hidden">
                  <Users className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsCreateProjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </div>
            </div>

            <ProjectSearch 
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* Estatísticas */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Projetos
                  </CardTitle>
                  <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{projects?.length}</div>
                  <p className="text-xs text-muted-foreground truncate">
                    em {currentCompany.name}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Ativos
                  </CardTitle>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {projects?.filter(p => p.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em andamento
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Concluídas
                  </CardTitle>
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {projects?.reduce((acc, p) => acc + p.completedTasks, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tarefas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Membros
                  </CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {projects?.length > 0 ? Math.max(...projects.map(p => p.members)) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Projetos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Seus Projetos</h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {filteredProjects?.length} projeto(s)
                </span>
              </div>
              
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects?.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{project.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm line-clamp-2">{project.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(project.id)}
                            className="h-8 w-8 p-0"
                          >
                            {project.favorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteProject(project.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                        <div className="flex items-center text-muted-foreground text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">
                            {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="sm:hidden">
                            {new Date(project.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{getProgressPercentage(project.completedTasks, project.tasks)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(project.completedTasks, project.tasks)} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{project.completedTasks}/{project.tasks} tarefas</span>
                          <span>{project.members} membros</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(project.members, 3))].map((_, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={`/placeholder-user-${i + 1}.jpg`} />
                              <AvatarFallback className="text-xs">U{i + 1}</AvatarFallback>
                            </Avatar>
                          ))}
                          {project.members > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                              +{project.members - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Atualizado há 2h</span>
                          <span className="sm:hidden">2h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredProjects?.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                    <Search className="h-full w-full" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-muted-foreground mb-4 text-sm px-4">
                    Tente ajustar os filtros ou criar um novo projeto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Diálogos */}
      <CreateProjectDialog 
        onCreateProject={handleCreateProject}
      />
      
      <InviteMembersDialog 
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </SidebarProvider>
  );
};

export default Dashboard;
