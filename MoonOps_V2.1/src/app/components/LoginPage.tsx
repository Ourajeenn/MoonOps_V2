import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { LogIn } from 'lucide-react';
import moonopsLogo from '@/assets/moonops-logo.png';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) {
      newErrors.email = 'L\'email est requis';
    }
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem('moonops_user', JSON.stringify(data.user));
          onLogin();
        } else {
          setErrors({ email: data.error || 'Échec de l\'authentification' });
        }
      } catch (err) {
        console.error('Erreur login:', err);
        setErrors({ email: 'Erreur de connexion serveur' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <Card className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative z-10 rounded-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <img src={moonopsLogo} alt="MoonOps" className="w-36 h-36 object-contain" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              DevOps Central
            </h1>
            <p className="text-blue-200/70 text-xs">
              Plateforme de déploiement automatisé
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-blue-100">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@techconsulting.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white/10 border-white/20 text-white placeholder-blue-200/50 focus:border-blue-400 focus:ring-blue-400/50 transition-all rounded-lg"
              />
              {errors.email && (
                <p className="text-sm text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-blue-100">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white/10 border-white/20 text-white placeholder-blue-200/50 focus:border-blue-400 focus:ring-blue-400/50 transition-all rounded-lg"
              />
              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              Se connecter
            </Button>
          </form>

          {/* Identifiants de démo */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-bold text-blue-100 mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Compte de démonstration
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-blue-200/70 font-medium">Email :</span>
                <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">
                  admin@techconsulting.fr
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200/70 font-medium">Mot de passe :</span>
                <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">
                  demo2026
                </code>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-blue-100/80 font-medium">
              Propulsé par DevOps Central
            </p>
            <p className="text-[10px] text-blue-200/40 mt-0.5">
              Automatisation & Déploiement DevOps
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
