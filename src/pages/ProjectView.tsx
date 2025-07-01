import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Users, Settings, Share, Star, MoreHorizontal, Eye, Edit3, Trash2, Calendar, Clock, Target } from 'lucide-react';
import BoardView from '@/components/BoardView';
import SettingsDialog from '@/components/SettingsDialog';
import ShareProjectDialog from '@/components/ShareProjectDialog';

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  // Simular carregamento do projeto
  useEffect(() => {
    // Em uma aplicação real, isso viria de uma API ou estado global
    const mockProject = {
      id: projectId,
      name: 'Projeto Marketing 2024',
      description: 'Campanhas e estratégias de marketing para o próximo ano',
      status: 'active',
      members: 5,
      tasks: 24,
      completedTasks: 18,
      dueDate: '2024-02-15',
      view: 'board',
      favorite: true,
      columns: [
        { id: '1', name: 'Tarefa', type: 'text', width: 250 },
        { id: '2', name: 'Status', type: 'status', width: 150, options: ['Pendente', 'Em Progresso', 'Concluído'] },
        { id: '3', name: 'Responsável', type: 'person', width: 150 },
        { id: '4', name: 'Data de Entrega', type: 'date', width: 140 },
        { id: '5', name: 'Prioridade', type: 'dropdown', width: 120, options: ['Baixa', 'Média', 'Alta'] }
      ],
      items: [
        {
          id: '1',
          '1': 'Criar campanha nas redes sociais',
          '2': 'Em Progresso',
          '3': 'user1',
          '4': '2024-01-30',
          '5': 'Alta'
        },
        {
          id: '2',
          '1': 'Desenvolver material gráfico',
          '2': 'Pendente',
          '3': 'user2',
          '4': '2024-02-05',
          '5': 'Média'
        }
      ]
    };
    setProject(mockProject);
  }, [projectId]);

  const handleUpdateProject = (updatedProject: any) => {
    setProject(updatedProject);
    // Em uma aplicação real, isso salvaria no backend
    console.log('Projeto atualizado:', updatedProject);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-1 sm:space-x-2 dark:text-slate-200 dark:hover:bg-slate-700 p-1 sm:p-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="h-4 sm:h-6 w-px bg-gray-300 dark:bg-slate-600"></div>
              <h1 className="text-sm sm:text-lg lg:text-xl font-semibold dark:text-slate-100 truncate">{project.name}</h1>
              <button
                onClick={() => handleUpdateProject({ ...project, favorite: !project.favorite })}
                className="text-gray-400 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400 flex-shrink-0"
              >
                <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${project.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Project Info - Hidden on small screens */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{project.completedTasks}/{project.tasks} tarefas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{project.members} membros</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.dueDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Compact project info for small screens */}
              <div className="flex md:hidden items-center space-x-2 text-xs text-gray-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>{project.completedTasks}/{project.tasks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{project.members}</span>
                </div>
              </div>

              <Badge className={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>

              {/* Actions */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <ShareProjectDialog project={project}>
                  <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 p-1 sm:p-2">
                    <Share className="h-4 w-4" />
                    <span className="hidden lg:inline ml-1 sm:ml-2">Compartilhar</span>
                  </Button>
                </ShareProjectDialog>

                {/* User Avatar */}
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarFallback className="dark:bg-slate-700 dark:text-slate-200 text-xs">U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
        <BoardView project={project} onUpdateProject={handleUpdateProject} />
      </main>
    </div>
  );
};

export default ProjectView;
