import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Server,
  RefreshCw,
  Zap,
  Radio,
  Eye,
  BarChart3,
  AlertCircle,
  Database,
  Globe,
  Smartphone,
  Layers,
  Monitor,
  Settings,
  Shield,
  Terminal
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

// Données simulées pour la démonstration
const generateRealtimeData = () => {
  const now = new Date();
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.toISOString(),
      cpu: Math.floor(Math.random() * 30) + 45 + Math.sin(i / 3) * 15,
      memory: Math.floor(Math.random() * 20) + 60 + Math.cos(i / 4) * 10,
      network: Math.floor(Math.random() * 50) + 200 + Math.sin(i / 2) * 30,
      response_time: Math.floor(Math.random() * 50) + 150 + Math.sin(i / 5) * 20
    });
  }
  return data;
};

const projects = [
  { id: 'p1-uuid-demo', name: 'E-Commerce Platform', type: 'web', status: 'ACTIVE' },
  { id: 'p2-uuid-demo', name: 'API Gateway Service', type: 'api', status: 'ACTIVE' },
  { id: 'p4-uuid-demo', name: 'Data Analytics Dashboard', type: 'web', status: 'ACTIVE' },
];

const alerts = [
  { id: '1', severity: 'CRITICAL', message: 'CPU usage > 85% on production', project: 'E-Commerce Platform', time: '5 min ago' },
  { id: '2', severity: 'WARNING', message: 'Memory usage > 80%', project: 'API Gateway Service', time: '12 min ago' },
  { id: '3', severity: 'INFO', message: 'Scheduled maintenance tonight', project: 'Data Analytics', time: '1h ago' },
];

const systemHealth = {
  overall: 98.5,
  services: [
    { name: 'PostgreSQL', status: 'UP', uptime: '99.9%', response_time: '12ms' },
    { name: 'Redis Cache', status: 'UP', uptime: '99.8%', response_time: '3ms' },
    { name: 'Load Balancer', status: 'UP', uptime: '99.9%', response_time: '8ms' },
    { name: 'GitLab CI/CD', status: 'UP', uptime: '98.5%', response_time: '45ms' },
  ]
};

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

export function MonitoringModule() {
  const [selectedProject, setSelectedProject] = useState('p1-uuid-demo');
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulation de mise à jour temps réel toutes les 30 secondes
    const interval = setInterval(() => {
      setRealtimeData(generateRealtimeData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info('Actualisation des métriques...');
    setTimeout(() => {
      setRealtimeData(generateRealtimeData());
      setIsRefreshing(false);
      toast.success('Métriques mises à jour !');
    }, 1000);
  };

  const currentProject = projects.find(p => p.id === selectedProject) || projects[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-full"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            Monitoring
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-3 ml-1">
            <Activity className="w-4 h-4 text-emerald-500" />
            Observabilité temps réel - Métriques & Alertes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-white border-slate-200 rounded-xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id} className="font-bold">
                  <div className="flex items-center gap-2">
                    {project.type === 'web' && <Globe className="w-4 h-4" />}
                    {project.type === 'api' && <Server className="w-4 h-4" />}
                    {project.type === 'mobile' && <Smartphone className="w-4 h-4" />}
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">État Système</h3>
              <p className="text-sm text-slate-400 font-medium">Vue d'ensemble de la santé des services</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold px-4 py-2">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {systemHealth.overall}% Santé
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealth.services.map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{service.name}</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5">
                    {service.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Uptime</span>
                    <span className="font-bold text-slate-900">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Réponse</span>
                    <span className="font-bold text-slate-900">{service.response_time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Metrics Charts */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Métriques Temps Réel</h3>
              <p className="text-sm text-slate-400 font-medium">Performance des dernières 24 heures</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-bold">
              <Activity className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-700">Utilisation CPU</span>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {Math.max(...realtimeData.map(d => d.cpu))}%
                </Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realtimeData}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontWeight: 600
                      }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-700">Utilisation Mémoire</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                  {Math.max(...realtimeData.map(d => d.memory))} GB
                </Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realtimeData}>
                    <defs>
                      <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontWeight: 600
                      }}
                    />
                    <Area type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} fill="url(#memoryGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Network Traffic */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-slate-700">Trafic Réseau</span>
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  {Math.max(...realtimeData.map(d => d.network))} Mbps
                </Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontWeight: 600
                      }}
                    />
                    <Line type="monotone" dataKey="network" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Response Time */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700">Temps de Réponse</span>
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  {Math.round(realtimeData[realtimeData.length - 1]?.response_time || 0)}ms
                </Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontWeight: 600
                      }}
                    />
                    <Line type="monotone" dataKey="response_time" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Alerts & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Alertes Actives</h3>
                  <p className="text-sm text-slate-400 font-medium">Notifications et incidents en cours</p>
                </div>
                <Badge className="bg-rose-100 text-rose-700 border-rose-200 font-bold px-3 py-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {alerts.length} Alertes
                </Badge>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    alert.severity === 'CRITICAL' ? "bg-rose-100 text-rose-600" :
                    alert.severity === 'WARNING' ? "bg-amber-100 text-amber-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{alert.project}</span>
                      <Badge className={cn(
                        "text-[10px] px-2 py-0.5",
                        alert.severity === 'CRITICAL' ? "bg-rose-100 text-rose-700" :
                        alert.severity === 'WARNING' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm">{alert.message}</p>
                    <p className="text-slate-400 text-xs mt-1">{alert.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h3 className="text-xl font-black mb-6">Actions Rapides</h3>
            <div className="space-y-3">
              <Button
                onClick={() => toast.success('Redémarrage du service demandé...')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Redémarrer Service
              </Button>
              <Button
                onClick={() => toast.success('Scale automatique activé...')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-4"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Scale Automatique
              </Button>
              <Button
                onClick={() => toast.success('Maintenance programmée...')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl py-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                Mode Maintenance
              </Button>
              <Button
                onClick={() => toast.success('Rapport généré...')}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 font-bold rounded-xl py-4"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Rapport Complet
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}