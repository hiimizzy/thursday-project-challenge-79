
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight, CheckCircle, Circle } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  completed: boolean;
}

const SetupActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', name: 'Configurar projeto inicial', completed: false },
    { id: '2', name: 'Definir objetivos da equipe', completed: false },
    { id: '3', name: 'Criar primeira reunião', completed: true }
  ]);
  const [newActivity, setNewActivity] = useState('');

  const addActivity = () => {
    if (newActivity.trim()) {
      const activity: Activity = {
        id: Date.now().toString(),
        name: newActivity.trim(),
        completed: false
      };
      setActivities([...activities, activity]);
      setNewActivity('');
    }
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const toggleActivity = (id: string) => {
    setActivities(activities.map(activity =>
      activity.id === id
        ? { ...activity, completed: !activity.completed }
        : activity
    ));
  };

  const handleFinish = () => {
    navigate('/dashboard');
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
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">✓</span>
            <div className="w-12 h-1 bg-blue-600"></div>
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">5</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Configure suas atividades</CardTitle>
            <CardDescription className="text-base">
              Liste as atividades iniciais do seu projeto e defina o status de cada uma
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Input
                placeholder="Digite uma nova atividade..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                className="flex-1"
              />
              <Button
                onClick={addActivity}
                disabled={!newActivity.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Atividades ({activities.length})
              </h4>
              
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma atividade adicionada ainda</p>
                  <p className="text-sm">Adicione algumas atividades para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        activity.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Checkbox
                        checked={activity.completed}
                        onCheckedChange={() => toggleActivity(activity.id)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <span
                        className={`flex-1 ${
                          activity.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {activity.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activities.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progresso</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activities.filter(a => a.completed).length} de {activities.length} concluídas
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(activities.filter(a => a.completed).length / activities.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <Button
                onClick={handleFinish}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Finalizar Configuração
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupActivities;
