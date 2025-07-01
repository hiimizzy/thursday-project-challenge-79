
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simular login com Google
    setTimeout(() => {
      setIsLoading(false);
      navigate('/onboarding');
    }, 1500);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    // Simular login/cadastro com email
    setTimeout(() => {
      setIsLoading(false);
      if (isSignUp) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
        </div>
        
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-blue-600">Thursday</h1>
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
            </CardTitle>
            <CardDescription className="text-base">
              {isSignUp ? 'Crie sua conta para começar' : 'Entre com sua conta para continuar'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isSignUp ? 'Criar conta' : 'Entrar'}
              </Button>
            </form>
            
            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a>{' '}
              e{' '}
              <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
