import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  FolderGit2,
  GitBranch,
  Activity,
  Clock,
  Sparkles,
  Rocket,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Server,
  Zap,
  Globe
} from 'lucide-react';
import moonopsLogo from '@/assets/moonops-logo.png';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

const deploymentsData = [
  { day: 'Lun', total: 24, success: 22 },
  { day: 'Mar', total: 18, success: 17 },
  { day: 'Mer', total: 32, success: 30 },
  { day: 'Jeu', total: 28, success: 27 },
  { day: 'Ven', total: 35, success: 33 },
  { day: 'Sam', total: 12, success: 12 },
  { day: 'Dim', total: 8, success: 8 },
];

const growthData = [
  { month: 'Jan', projets: 12 },
  { month: 'Fév', projets: 19 },
  { month: 'Mar', projets: 25 },
  { month: 'Avr', projets: 32 },
  { month: 'Mai', projets: 38 },
  { month: 'Juin', projets: 45 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Project {
  id: string;
  name: string;
  status: string;
  template_type: string;
  last_deployed_at?: string;
}

export function DashboardOverview() {
  const [stats, setStats] = useState({
    total_projects: 0,
    active_projects: 0,
    total_deployments: 0,
    success_rate: 98.2
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        fetch('http://localhost:5000/api/stats'),
        fetch('http://localhost:5000/api/projects')
      ]);
      
      const statsData = await statsRes.json();
      const projectsData = await projectsRes.json();
      
      setStats(statsData);
      setProjects(projectsData);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setIsLoading(false);
    }
  };

  // Données du graphique basées sur les vrais projets
  const projectStatusData = [
    { 
      name: 'Actifs', 
      value: projects.filter(p => p.status === 'ACTIVE').length || 0, 
      color: '#10b981' 
    },
    { 
      name: 'En attente', 
      value: projects.filter(p => p.status === 'PENDING').length || 0, 
      color: '#f59e0b' 
    },
    { 
      name: 'Maintenance', 
      value: projects.filter(p => p.status === 'MAINTENANCE').length || 0, 
      color: '#64748b' 
    },
  ].filter(d => d.value > 0);

  // Derniers projets pour l'activité
  const recentProjects = projects.slice(0, 5);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-8 space-y-8 min-h-full"
      style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}
    >
      {/* Hero Header */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 md:p-10"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-xl"
            >
              <img src={moonopsLogo} alt="MoonOps" className="w-14 h-14 object-contain" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Bonjour, Admin 👋
              </h1>
              <p className="text-blue-100 font-medium flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4" />
                Bienvenue sur votre cockpit MoonOps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30 font-bold px-4 py-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
              Système Opérationnel
            </Badge>
          </div>
        </div>

        {/* Quick Stats in Header */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Projets', value: stats.total_projects, icon: FolderGit2 },
            { label: 'Actifs', value: stats.active_projects, icon: Activity },
            { label: 'Déploiements', value: stats.total_deployments, icon: Rocket },
            { label: 'Succès', value: `${stats.success_rate}%`, icon: CheckCircle2 },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">{item.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Chart - Large */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Performance Hebdo</h3>
                <p className="text-sm text-slate-400 font-medium">Déploiements des 7 derniers jours</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deploymentsData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontWeight: 600
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#e2e8f0" 
                    radius={[8, 8, 8, 8]} 
                    barSize={32}
                    name="Total" 
                  />
                  <Bar 
                    dataKey="success" 
                    fill="#3b82f6" 
                    radius={[8, 8, 8, 8]} 
                    barSize={32}
                    name="Réussis" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Project Status Pie */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white h-full">
            <h3 className="text-xl font-black text-slate-900 mb-2">État des Projets</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Répartition par statut</p>
            
            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData.length > 0 ? projectStatusData : [{ name: 'Aucun', value: 1, color: '#e2e8f0' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(projectStatusData.length > 0 ? projectStatusData : [{ color: '#e2e8f0' }]).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900">{stats.total_projects}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {projectStatusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Activité Récente</h3>
                  <p className="text-sm text-slate-400 font-medium">Derniers projets</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 font-bold"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'projects' }))}
                >
                  Voir tout
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {recentProjects.length === 0 ? (
                <div className="p-10 text-center">
                  <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Aucun projet</p>
                  <p className="text-slate-300 text-sm">Créez votre premier projet !</p>
                </div>
              ) : (
                recentProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      project.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-600" :
                      project.status === 'PENDING' ? "bg-amber-100 text-amber-600" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {project.status === 'ACTIVE' ? <CheckCircle2 className="w-5 h-5" /> :
                       project.status === 'PENDING' ? <Clock className="w-5 h-5" /> :
                       <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{project.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="capitalize">{project.template_type}</span>
                        {project.last_deployed_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(project.last_deployed_at).toLocaleDateString('fr-FR')}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <Badge className={cn(
                      "shrink-0 font-bold text-[10px]",
                      project.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" :
                      project.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {project.status === 'ACTIVE' ? 'ACTIF' : 
                       project.status === 'PENDING' ? 'EN ATTENTE' : project.status}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions / Growth */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Croissance</h3>
                <p className="text-sm text-slate-400 font-medium">Évolution mensuelle</p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-slate-600">+275%</span>
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontWeight: 600
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projets" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorGrowth)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button 
                className="h-auto py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex flex-col items-center gap-2"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'projects' }))}
              >
                <FolderGit2 className="w-5 h-5" />
                <span className="text-xs">Projets</span>
              </Button>
              <Button 
                variant="outline"
                className="h-auto py-4 border-slate-200 text-slate-700 font-bold rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'cicd' }))}
              >
                <Rocket className="w-5 h-5" />
                <span className="text-xs">CI/CD</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
