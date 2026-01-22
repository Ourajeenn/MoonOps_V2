import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { DashboardOverview } from '@/app/components/DashboardOverview';
import { ProjectsModule } from '@/app/components/ProjectsModule';
import { CICDModule } from '@/app/components/CICDModule';
import { MonitoringModule } from '@/app/components/MonitoringModule';
import { SecurityModule } from '@/app/components/SecurityModule';
import { AdminModule } from '@/app/components/AdminModule';
import { LoginPage } from '@/app/components/LoginPage';
import { HelpDeskModule } from '@/app/components/HelpDeskModule';
import { Toaster } from 'sonner';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Écouter les événements de navigation depuis d'autres composants
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const target = event.detail;
      if (target && typeof target === 'string') {
        setActiveView(target);
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50/50">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main className="flex-1 overflow-y-auto relative">
        {activeView === 'dashboard' && <DashboardOverview />}
        {activeView === 'projects' && <ProjectsModule />}
        {activeView === 'cicd' && <CICDModule />}
        {activeView === 'monitoring' && <MonitoringModule />}
        {activeView === 'security' && <SecurityModule />}
        {activeView === 'helpdesk' && <HelpDeskModule />}
        {activeView === 'admin' && <AdminModule />}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}