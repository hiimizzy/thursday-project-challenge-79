
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Building, Plus, Check } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
}

interface CompanySelectorProps {
  companies: Company[];
  currentCompany: Company | null;
  onCompanyChange: (company: Company) => void;
  onCreateCompany: (name: string) => void;
}

const CompanySelector = ({ companies, currentCompany, onCompanyChange, onCreateCompany }: CompanySelectorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const handleCreateCompany = () => {
    if (newCompanyName.trim()) {
      onCreateCompany(newCompanyName.trim());
      setNewCompanyName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentCompany?.id || ''}
        onValueChange={(value) => {
          const company = companies.find(c => c.id === value);
          if (company) onCompanyChange(company);
        }}
      >
        <SelectTrigger className="w-48">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <SelectValue placeholder="Selecionar empresa" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex items-center justify-between w-full">
                <span>{company.name}</span>
                <span className="text-xs text-gray-500 ml-2">({company.role})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Empresa</DialogTitle>
            <DialogDescription>
              Digite o nome da sua nova empresa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da empresa"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCompany()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCompany} disabled={!newCompanyName.trim()}>
                Criar Empresa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySelector;
