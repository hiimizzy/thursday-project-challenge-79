
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';

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

interface CreateProjectDialogProps {
  onCreateProject: (project: Project) => void;
}

const CreateProjectDialog = ({ onCreateProject }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectView, setProjectView] = useState('kanban');

  const handleCreate = () => {
    if (projectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectName,
        description: projectDescription,
        status: 'active',
        members: 1,
        tasks: 0,
        completedTasks: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        favorite: false,
        companyId: '' // Will be set by parent component
      };
      
      onCreateProject(newProject);
      setProjectName('');
      setProjectDescription('');
      setProjectView('kanban');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>
            Configure seu novo projeto e comece a colaborar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Projeto</label>
            <Input
              placeholder="Digite o nome do projeto..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Descreva o objetivo do projeto..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Visualização Padrão</label>
            <Select value={projectView} onValueChange={setProjectView}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kanban">Kanban</SelectItem>
                <SelectItem value="board">Quadro</SelectItem>
                <SelectItem value="calendar">Calendário</SelectItem>
                <SelectItem value="timeline">Cronograma</SelectItem>
                <SelectItem value="cards">Cartões</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">
            Criar Projeto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
