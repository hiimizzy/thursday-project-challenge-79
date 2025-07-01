
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, BarChart3, Star, ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Colaboração em Tempo Real",
      description: "Trabalhe em equipe com atualizações instantâneas e sincronização perfeita."
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Múltiplas Visualizações",
      description: "Kanban, Quadro, Cronograma, Calendário - escolha como prefere trabalhar."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Gestão Inteligente",
      description: "Acompanhe projetos, tarefas, CRM e muito mais em um só lugar."
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Gerente de Projetos",
      company: "TechCorp",
      content: "O Thursday revolucionou nossa gestão de projetos. A interface é intuitiva e as funcionalidades são exatamente o que precisávamos.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "CEO",
      company: "StartupX",
      content: "Migramos do Monday.com para o Thursday e não nos arrependemos. Muito mais flexível e eficiente.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Designer UX",
      company: "CreativeAgency",
      content: "A colaboração em tempo real é fantástica. Nossa equipe nunca foi tão produtiva.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Thursday</h1>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Recursos
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Depoimentos
                </a>
                <Link to="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Entrar
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Recursos
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Depoimentos
              </a>
              <Link to="/login" className="block px-3 py-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gerencie seus projetos com
              <span className="text-blue-600 block">Thursday</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A plataforma de gerenciamento de projetos que sua equipe precisa. 
              Colaboração em tempo real, múltiplas visualizações e controle total sobre seus projetos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Thursday?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desenvolvido para equipes modernas que precisam de eficiência e colaboração
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Recursos Avançados
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Convites por email com controle de permissões</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Múltiplas empresas em uma conta</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Tipos de coluna personalizáveis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Salvamento automático</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Busca e filtros avançados</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white">
              <h4 className="text-xl font-bold mb-4">Comece Hoje Mesmo</h4>
              <p className="mb-6">
                Junte-se a milhares de equipes que já transformaram sua produtividade com o Thursday.
              </p>
              <Link to="/login">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Criar Conta Gratuita
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de equipes que transformaram seus projetos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar sua gestão de projetos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comece gratuitamente e veja como o Thursday pode revolucionar sua equipe.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Thursday</h3>
            <p className="text-gray-400 mb-8">
              A nova era do gerenciamento de projetos começou.
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">
                © 2024 Thursday. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
