
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Target, Briefcase, BookOpen, TrendingUp, Search, CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    purpose: '',
    teamSize: ''
  });

  const purposes = [
    { value: 'individual', label: 'Trabalho Individual', icon: <Target className="h-5 w-5" /> },
    { value: 'team', label: 'Trabalho em Grupo', icon: <Users className="h-5 w-5" /> },
    { value: 'tasks', label: 'Gestão de Tarefa', icon: <CheckCircle className="h-5 w-5" /> },
    { value: 'projects', label: 'Gestão de Projeto', icon: <Briefcase className="h-5 w-5" /> },
    { value: 'crm', label: 'CRM', icon: <TrendingUp className="h-5 w-5" /> },
    { value: 'research', label: 'Pesquisa Acadêmica', icon: <BookOpen className="h-5 w-5" /> },
    { value: 'strategy', label: 'Metas e Estratégias', icon: <Search className="h-5 w-5" /> }
  ];

  const teamSizes = [
    { value: 'solo', label: 'Apenas Eu' },
    { value: '2-5', label: '2-5 pessoas' },
    { value: '5-15', label: '5-15 pessoas' },
    { value: '15-25', label: '15-25 pessoas' },
    { value: '25-55', label: '25-55 pessoas' },
    { value: '55-100', label: '55-100 pessoas' }
  ];

  const handleNext = () => {
    if (currentStep === 1 && answers.purpose) {
      setCurrentStep(2);
    } else if (currentStep === 2 && answers.teamSize) {
      navigate('/invite-team');
    }
  };

  const handlePurposeChange = (value: string) => {
    setAnswers({ ...answers, purpose: value });
  };

  const handleTeamSizeChange = (value: string) => {
    setAnswers({ ...answers, teamSize: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Thursday</h1>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              1
            </span>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              2
            </span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentStep === 1 ? 'Como você pretende usar o Thursday?' : 'Quantas pessoas vão contribuir?'}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 
                ? 'Isso nos ajuda a personalizar sua experiência' 
                : 'Vamos configurar o tamanho ideal da sua equipe'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <RadioGroup value={answers.purpose} onValueChange={handlePurposeChange} className="space-y-3">
                {purposes.map((purpose) => (
                  <div key={purpose.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={purpose.value} id={purpose.value} />
                    <Label htmlFor={purpose.value} className="flex items-center space-x-3 cursor-pointer flex-1">
                      <div className="text-blue-600">
                        {purpose.icon}
                      </div>
                      <span className="text-base">{purpose.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentStep === 2 && (
              <RadioGroup value={answers.teamSize} onValueChange={handleTeamSizeChange} className="space-y-3">
                {teamSizes.map((size) => (
                  <div key={size.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={size.value} id={size.value} />
                    <Label htmlFor={size.value} className="cursor-pointer flex-1">
                      <span className="text-base">{size.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !answers.purpose) ||
                  (currentStep === 2 && !answers.teamSize)
                }
                className="ml-auto bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === 2 ? 'Continuar' : 'Próximo'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
