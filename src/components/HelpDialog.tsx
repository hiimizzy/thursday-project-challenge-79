
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleHelp, BookOpen, Users, FolderPlus, Settings } from 'lucide-react';

interface HelpDialogProps {
  trigger?: React.ReactNode;
}

const HelpDialog = ({ trigger }: HelpDialogProps) => {
  const [open, setOpen] = useState(false);

  const helpSections = [
    {
      icon: <FolderPlus className="h-5 w-5 text-blue-600" />,
      title: "Criando Projetos",
      description: "Clique no botão 'Novo Projeto' para criar um projeto. Defina nome, descrição e escolha a visualização padrão."
    },
    {
      icon: <BookOpen className="h-5 w-5 text-green-600" />,
      title: "Visualização de Quadro",
      description: "Use quadros para organizar tarefas. Adicione colunas, edite itens diretamente na tabela e organize por status, data ou prioridade."
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: "Gerenciando Equipe",
      description: "Convide membros para colaborar. Use o botão 'Convidar Membros' para enviar convites por email com diferentes níveis de acesso."
    },
    {
      icon: <Settings className="h-5 w-5 text-orange-600" />,
      title: "Configurações",
      description: "Personalize sua conta nas configurações: altere foto de perfil, ative modo escuro e gerencie configurações da empresa."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <CircleHelp className="h-4 w-4 mr-2" />
            Ajuda
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleHelp className="h-5 w-5 text-blue-600" />
            Como usar o Thursday
          </DialogTitle>
          <DialogDescription>
            Guia rápido para começar a usar a plataforma
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {helpSections.map((section, index) => (
            <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-shrink-0">
                {section.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Dicas importantes
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use o seletor de empresa para alternar entre diferentes organizações</li>
              <li>• Projetos favoritos aparecem com uma estrela dourada</li>
              <li>• Clique em qualquer projeto para abrir a visualização detalhada</li>
              <li>• Use a busca para encontrar projetos rapidamente</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setOpen(false)}>
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
