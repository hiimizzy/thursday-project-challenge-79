
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, X, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';


interface InviteMembersDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// configurações emailjs
const emailjsConfig = {
    serviceId: 'service_eeqq7lx',
    templateId: 'template_spjym7k',
    publicKey: '8xB0j44NLXOwhu8Q7'
  };


interface PendingInvite {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

const InviteMembersDialog = ({ open, onOpenChange }: InviteMembersDialogProps) => {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const addInvite = () => {
    if (newEmail && newEmail.includes('@') && !invites.some(invite => invite.email === newEmail)) {
      const newInvite: PendingInvite = {
        id: Date.now().toString(),
        email: newEmail,
        role: newRole
      };
      setInvites([...invites, newInvite]);
      setNewEmail('');
      setNewRole('member');
    }
  };

  const removeInvite = (id: string) => {
    setInvites(invites.filter(invite => invite.id !== id));
  };

  // const sendInvites = async () => {
  //   if (invites.length === 0) return;

  //   setIsSending(true);

  //   try {
  //     // Simular envio de emails
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     toast({
  //       title: "Convites enviados!",
  //       description: `${invites.length} convite(s) enviado(s) com sucesso.`,
  //     });

  //     setInvites([]);
  //     onOpenChange?.(false);
  //   } catch (error) {
  //     toast({
  //       title: "Erro ao enviar convites",
  //       description: "Tente novamente em alguns instantes.",
  //       variant: "destructive"
  //     });
  //   } finally {
  //     setIsSending(false);
  //   }
  // };



  const sendInvites = async () => {
  if (invites.length === 0) return;

  setIsSending(true);

  try {
    for (const invite of invites) {

      console.log("Enviando convite para:", invite.email);
       if (!invite.email || !invite.email.includes("@")) {
      console.error("Email inválido:", invite);
      continue; 
      }

      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
        to_email: 'seuemail@exemplo.com',
        message: 'Você foi convidado para colaborar em nossa plataforma!',
        role: 'Membro',
        custom_message: 'Estamos felizes em ter você com a gente!',
        },
        emailjsConfig.publicKey
      );
    }

    toast({
      title: "Convites enviados!",
      description: `${invites.length} convite(s) enviado(s) com sucesso.`,
    });

    setInvites([]);
    onOpenChange?.(false);

  } catch (error) {
    console.error("Erro ao enviar e-mails:", error);
    toast({
      title: "Erro ao enviar convites",
      description: "Tente novamente em alguns instantes.",
      variant: "destructive"
    });
  } finally {
    setIsSending(false);
  }
};


  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'member': return 'Membro';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Convidar Membros
          </DialogTitle>
          <DialogDescription>
            Convide pessoas para colaborar na sua empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInvite()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={newRole} onValueChange={(value: 'admin' | 'member' | 'viewer') => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={addInvite}
              disabled={!newEmail || !newEmail.includes('@')}
              variant="outline"
              className="w-full"
            >
              Adicionar à Lista
            </Button>
          </div>

          {invites.length > 0 && (
            <div className="space-y-3">
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">
                  Convites pendentes ({invites.length})
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{invite.email}</p>
                          <p className="text-xs text-gray-500">{getRoleLabel(invite.role)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvite(invite.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Funções:</h5>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Admin:</strong> Acesso total</li>
              <li>• <strong>Membro:</strong> Pode editar projetos</li>
              <li>• <strong>Visualizador:</strong> Apenas visualização</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={sendInvites}
            disabled={invites.length === 0 || isSending}
            className="flex-1"
          >
            {isSending ? (
              "Enviando..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar {invites.length > 0 && `(${invites.length})`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMembersDialog;
