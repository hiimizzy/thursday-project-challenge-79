
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { Plus, X, Mail, Users, ArrowRight } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'member';
}

const InviteTeam = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');

  const addInvite = () => {
    if (newEmail && newEmail.includes('@')) {
      const newInvite: TeamMember = {
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

  const handleSubmit = () => {
    // Simular envio de convites
    navigate('/choose-view');
  };

  const skipInvites = () => {
    navigate('/choose-view');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Thursday</h1>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">3</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Convide sua equipe</CardTitle>
            <CardDescription className="text-base">
              Adicione membros da equipe para começar a colaborar. Você pode fazer isso agora ou mais tarde.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite o email do membro"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInvite()}
                  />
                </div>
                <div className="sm:w-32">
                  <Label>Função</Label>
                  <Select value={newRole} onValueChange={(value: 'admin' | 'member') => setNewRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addInvite}
                    disabled={!newEmail || !newEmail.includes('@')}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Mail className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Funções:
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Admin:</strong> Pode convidar pessoas, gerenciar configurações e editar conteúdo</div>
                  <div><strong>Membro:</strong> Pode editar e criar conteúdo</div>
                </div>
              </div>
            </div>

            {invites.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Convites ({invites.length})</h4>
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{invite.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{invite.role}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvite(invite.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                variant="outline"
                onClick={skipInvites}
                className="flex-1"
              >
                Fazer isso mais tarde
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {invites.length > 0 ? `Enviar ${invites.length} convite(s)` : 'Continuar'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteTeam;
