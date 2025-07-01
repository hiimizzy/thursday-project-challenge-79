import { useState, useEffect } from 'react';
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
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import HelpDialog from '@/components/HelpDialog';
import ThemeToggle from '@/components/ThemeToggle';
import emailjs from '@emailjs/browser';


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

const mockCompanies: Company[] = [
  { id: '1', name: 'Minha Empresa', role: 'admin' },
  { id: '2', name: 'Freelance Projects', role: 'member' },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Redesign do Site',
    description: 'Atualização completa da interface do usuário',
    status: 'active',
    members: 4,
    tasks: 12,
    completedTasks: 8,
    dueDate: '2024-01-15',
    favorite: true,
    companyId: '1'
  },
  {
    id: '2',
    name: 'App Mobile',
    description: 'Desenvolvimento do aplicativo móvel',
    status: 'active',
    members: 6,
    tasks: 24,
    completedTasks: 15,
    dueDate: '2024-02-28',
    favorite: false,
    companyId: '1'
  },
  {
    id: '3',
    name: 'Sistema de CRM',
    description: 'Implementação do sistema de gestão de clientes',
    status: 'paused',
    members: 3,
    tasks: 18,
    completedTasks: 5,
    dueDate: '2024-03-10',
    favorite: true,
    companyId: '2'
  }
];

const Dashboard = () => {
  const [allProjects, setAllProjects] = useState<Project[]>(mockProjects);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [currentCompany, setCurrentCompany] = useState<Company>(mockCompanies[0]);
  const [profileImage, setProfileImage] = useState('');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    status: 'all',
    members: 'all',
    dateFrom: null,
    dateTo: null,
    assignee: 'all'
  });
  
  const { toast } = useToast();
  
  // Fix: Pass proper options object to useRealtimeSync
  useRealtimeSync({
    entityType: 'company',
    entityId: currentCompany.id,
    onUpdate: (data) => {
      console.log('Received realtime update:', data);
    },
    onError: (error) => {
      console.error('Realtime sync error:', error);
    }
  });

  // Fix NaN% 
  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Filtrar projetos pela empresa atual
  const projects = allProjects.filter(project => project.companyId === currentCompany.id);

  const handleCreateProject = (newProject: Project) => {
    const projectWithCompany = {
      ...newProject,
      companyId: currentCompany.id
    };
    setAllProjects([...allProjects, projectWithCompany]);
    setIsCreateProjectOpen(false);
    toast({
      title: "Projeto criado!",
      description: `${newProject.name} foi criado com sucesso.`,
    });
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

  const toggleFavorite = (projectId: string) => {
    setAllProjects(allProjects.map(project => 
      project.id === projectId 
        ? { ...project, favorite: !project.favorite }
        : project
    ));
  };

  const deleteProject = (projectId: string) => {
    setAllProjects(allProjects.filter(project => project.id !== projectId));
    toast({
      title: "Projeto excluído",
      description: "O projeto foi excluído com sucesso.",
      variant: "destructive"
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

  // Aplicar filtros
  const filteredProjects = projects.filter(project => {
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
          {/* Header Mobile */}
          <header className="flex h-14 items-center shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex items-center gap-2 flex-1">
              <Building className="h-4 w-4 text-blue-600  flex-shrink-0" />
              <h1 className="text-base font-semibold truncate">{currentCompany.name}</h1>
            </div>
            <div className="flex gap-1">
              {/* Dark/Light */}
              <ThemeToggle />
              <HelpDialog trigger={
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <CircleHelp className="h-4 w-4" />
                </Button>
              } />
              {/* Convidar */}
              <Button onClick={() => setIsInviteOpen(true)} variant="outline" size="sm">
                <Users className="h-4 w-4" />
              </Button>

              <CreateProjectDialog onCreateProject={handleCreateProject}/>
              
              {/* Botão mobile */} 
              {/* <Button className="bg-blue-500 hover:bg-blue-700" onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New
              </Button> */}
            </div>
          </header>

          <div className="flex-1 space-y-4 p-4 md:p-8">
            {/* Header Desktop */}
            <div className="hidden md:flex md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Gerencie seus projetos em {currentCompany.name}
                </p>
              </div>
              <div className="flex gap-2">
                <ThemeToggle />
                <HelpDialog />
                <Button onClick={() => setIsInviteOpen(true)} variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
                
                <CreateProjectDialog onCreateProject={handleCreateProject}/> 
                
              </div>
            </div>

            {/* Busca e Filtros Avançados */}
            <ProjectSearch 
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* Estatísticas */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Projetos
                  </CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">
                    em {currentCompany.name}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Projetos Ativos
                  </CardTitle>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em andamento
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tarefas Concluídas
                  </CardTitle>
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.reduce((acc, p) => acc + p.completedTasks, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De {projects.reduce((acc, p) => acc + p.tasks, 0)} tarefas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Membros da Equipe
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.length > 0 ? Math.max(...projects.map(p => p.members)) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Membros ativos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Projetos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Seus Projetos</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredProjects.length} projeto(s) encontrado(s)
                </span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-1">
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
                              {/* <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem> */}
                              {/* <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem> */}
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
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(project.dueDate).toLocaleDateString('pt-BR')}
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
                          Atualizado há 2h
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                    <Search className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou criar um novo projeto.
                  </p>
                  {/* <Button onClick={() => setIsCreateProjectOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>  */}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>



      <InviteMembersDialog 
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </SidebarProvider>
  );
};

export default Dashboard;
