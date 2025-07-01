
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Table, Calendar, Kanban, CreditCard, Clock } from 'lucide-react';

const ChooseView = () => {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('');

  const views = [
    {
      id: 'kanban',
      name: 'Kanban',
      description: 'Visualize o fluxo de trabalho com cartões',
      icon: <Kanban className="h-8 w-8" />,
      preview: 'Perfeito para acompanhar status de tarefas'
    },
    {
      id: 'board',
      name: 'Quadro',
      description: 'Visualização em tabela tradicional',
      icon: <Table className="h-8 w-8" />,
      preview: 'Ideal para dados estruturados'
    },
    {
      id: 'timeline',
      name: 'Cronograma',
      description: 'Linha do tempo dos seus projetos',
      icon: <Clock className="h-8 w-8" />,
      preview: 'Ótimo para planejamento temporal'
    },
    {
      id: 'calendar',
      name: 'Calendário',
      description: 'Visualize datas e prazos',
      icon: <Calendar className="h-8 w-8" />,
      preview: 'Controle total sobre prazos'
    },
    {
      id: 'cards',
      name: 'Cartões',
      description: 'Cartões visuais organizados',
      icon: <CreditCard className="h-8 w-8" />,
      preview: 'Interface limpa e organizada'
    }
  ];

  const handleContinue = () => {
    if (selectedView) {
      navigate('/setup-activities');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Thursday</h1>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">4</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <LayoutGrid className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Escolha sua visualização</CardTitle>
            <CardDescription className="text-base">
              Como você prefere visualizar e organizar seus projetos?
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {views.map((view) => (
                <div
                  key={view.id}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedView === view.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedView(view.id)}
                >
                  <div className={`mb-4 ${selectedView === view.id ? 'text-blue-600' : 'text-gray-600'}`}>
                    {view.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{view.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{view.description}</p>
                  <p className="text-xs text-gray-500">{view.preview}</p>
                </div>
              ))}
            </div>

            {selectedView && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Visualização selecionada: {views.find(v => v.id === selectedView)?.name}
                </h4>
                <p className="text-blue-700 text-sm">
                  Você poderá alterar a visualização a qualquer momento no dashboard.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <Button
                onClick={handleContinue}
                disabled={!selectedView}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChooseView;
