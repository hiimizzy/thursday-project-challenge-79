
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share, Copy, Mail, Link, Users, Eye, Edit3, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ShareProjectDialogProps {
  project: any;
  children: React.ReactNode;
}

const ShareProjectDialog = ({ project, children }: ShareProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [shareLink, setShareLink] = useState(`${window.location.origin}/project/${project.id}`);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copiado!",
      description: "O link do projeto foi copiado para a área de transferência.",
    });
  };

  const sendInvite = () => {
    if (shareEmail && shareEmail.includes('@')) {
      // Simular envio de convite
      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${shareEmail} como ${getRoleLabel(shareRole)}.`,
      });
      setShareEmail('');
    }
  };

  const togglePublic = () => {
    setIsPublic(!isPublic);
    toast({
      title: isPublic ? "Projeto tornado privado" : "Projeto tornado público",
      description: isPublic ? 
        "Apenas membros convidados podem acessar." : 
        "Qualquer pessoa com o link pode visualizar.",
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'editor': return <Edit3 className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5 text-blue-600" />
            Compartilhar Projeto
          </DialogTitle>
          <DialogDescription>
            Compartilhe "{project.name}" com outras pessoas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Link do Projeto */}
          <div className="space-y-2">
            <Label>Link do Projeto</Label>
            <div className="flex gap-2">
              <Input 
                value={shareLink} 
                readOnly 
                className="bg-gray-50"
              />
              <Button onClick={copyLink} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tornar Público */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Acesso Público</p>
                <p className="text-xs text-gray-600">Qualquer pessoa com o link pode visualizar</p>
              </div>
            </div>
            <Button 
              onClick={togglePublic}
              variant={isPublic ? "default" : "outline"}
              size="sm"
            >
              {isPublic ? "Ativo" : "Inativo"}
            </Button>
          </div>

          {/* Convidar por Email */}
          <div className="space-y-3 border-t pt-4">
            <Label>Convidar por Email</Label>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
              <Select value={shareRole} onValueChange={(value: 'viewer' | 'editor' | 'admin') => setShareRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Visualizador
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Editor
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={sendInvite}
                disabled={!shareEmail || !shareEmail.includes('@')}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </div>

          {/* Membros Atuais (simulado) */}
          <div className="space-y-3 border-t pt-4">
            <Label>Membros do Projeto ({project.members})</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {/* Simulação de membros */}
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">João Silva</p>
                    <p className="text-xs text-gray-500">joao@empresa.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  {getRoleIcon('admin')}
                  Admin
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Maria Santos</p>
                    <p className="text-xs text-gray-500">maria@empresa.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  {getRoleIcon('editor')}
                  Editor
                </div>
              </div>
            </div>
          </div>

          {/* Informações sobre Permissões */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Permissões:</h5>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Admin:</strong> Controle total do projeto</li>
              <li>• <strong>Editor:</strong> Pode editar tarefas e conteúdo</li>
              <li>• <strong>Visualizador:</strong> Apenas visualização</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProjectDialog;
