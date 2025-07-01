
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  Users, 
  LogOut,
  Plus,
  User,
  Building
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreateProjectDialog from './CreateProjectDialog';
import InviteMembersDialog from './InviteMembersDialog';
import CompanySelector from './CompanySelector';

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
}

interface Company {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
}

interface AppSidebarProps {
  currentCompany: Company | null;
  profileImage: string;
  onProfileImageChange: (image: string) => void;
  projects: Project[];
  onCreateProject: (project: Project) => void;
  companies: Company[];
  onCompanyChange: (company: Company) => void;
  onCreateCompany: (name: string) => void;
}

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Projetos', url: '/dashboard', icon: FolderKanban },
];

export function AppSidebar({ 
  currentCompany, 
  profileImage, 
  onProfileImageChange, 
  projects, 
  onCreateProject,
  companies,
  onCompanyChange,
  onCreateCompany
}: AppSidebarProps) {
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const isCollapsed = state === 'collapsed' && !isMobile;
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar 
      className={isCollapsed ? "w-14" : "w-64"} 
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <SidebarHeader className="p-4">
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-600">Thursday</div>
            </div>
            
            {/* Company Selector */}
            <CompanySelector
              companies={companies}
              currentCompany={currentCompany}
              onCompanyChange={onCompanyChange}
              onCreateCompany={onCreateCompany}
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url} className="flex items-center">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Projetos Recentes */}
        <SidebarGroup>
          <SidebarGroupLabel>Projetos Recentes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.slice(0, 3).map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton 
                    asChild
                    tooltip={isCollapsed ? project.name : undefined}
                  >
                    <NavLink 
                      to={`/project/${project.id}`}
                      className="flex items-center"
                    >
                      <FolderKanban className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="ml-2 truncate">{project.name}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ações Rápidas - Apenas Mobile - Somente Convidar Membros */}
        {isMobile && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Ações</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsInviteOpen(true)}>
                      <Users className="h-4 w-4" />
                      <span className="ml-2">Convidar Membros</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          {/* Perfil do Usuário */}
          {!isCollapsed && (
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileImage} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">Usuário</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentCompany?.role || 'Membro'}
                </div>
              </div>
            </div>
          )}

          {/* Botão Sair - Apenas Mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
        </div>
      </SidebarFooter>

      {/* Diálogos - Apenas Mobile - Sem CreateProjectDialog */}
      {isMobile && (
        <InviteMembersDialog 
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
        />
      )}
    </Sidebar>
  );
}
