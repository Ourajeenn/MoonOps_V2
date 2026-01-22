import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  Rocket,
  ChevronRight,
  Terminal,
  Cpu,
  ShieldCheck,
  History,
  RefreshCw,
  Server,
  Activity,
  Layers,
  Zap,
  ArrowRight,
  Package,
  Globe,
  CloudUpload
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

// Types
interface Project {
  id: string;
  name: string;
  status: string;
  template_type: string;
  client_name?: string;
  last_deployed_at?: string;
  created_at?: string;
}

interface Deployment {
  id: string;
  project_id: string;
  project_name: string;
  environment: string;
  version: string;
  status: string;
  time_ago: string;
}

interface Pipeline {
  id: string;
  project_name: string;
  branch: string;
  status: string;
  stages: Stage[];
  commit: string;
  time: string;
  progress?: number;
  template_type?: string;
}

interface Stage {
  name: string;
  status: string;
  duration: string;
  icon: any;
}

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

// Génère les stages d'un pipeline basé sur le statut du projet
function generateStages(projectStatus: string): Stage[] {
  if (projectStatus === 'ACTIVE') {
    return [
      { name: 'Build', status: 'success', duration: '2m 34s', icon: Cpu },
      { name: 'Tests', status: 'success', duration: '5m 12s', icon: Terminal },
      { name: 'Security', status: 'success', duration: '3m 45s', icon: ShieldCheck },
      { name: 'Deploy', status: 'success', duration: '1m 20s', icon: Rocket },
    ];
  } else if (projectStatus === 'PENDING') {
    return [
      { name: 'Build', status: 'pending', duration: '-', icon: Cpu },
      { name: 'Tests', status: 'pending', duration: '-', icon: Terminal },
      { name: 'Security', status: 'pending', duration: '-', icon: ShieldCheck },
      { name: 'Deploy', status: 'pending', duration: '-', icon: Rocket },
    ];
  } else {
    return [
      { name: 'Build', status: 'success', duration: '1m 45s', icon: Cpu },
      { name: 'Tests', status: 'success', duration: '2m 20s', icon: Terminal },
      { name: 'Security', status: 'running', duration: '-', icon: ShieldCheck },
      { name: 'Deploy', status: 'pending', duration: '-', icon: Rocket },
    ];
  }
}

export function CICDModule() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('PRODUCTION');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pipelines' | 'history'>('pipelines');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadProjects(),
      loadDeployments()
    ]);
    setIsLoading(false);
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      setProjects(data);
      
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
        
        // Générer les pipelines basés sur les vrais projets
        const generatedPipelines: Pipeline[] = data.slice(0, 10).map((p: Project) => ({
          id: p.id,
          project_name: p.name,
          branch: 'main',
          status: p.status === 'ACTIVE' ? 'success' : p.status === 'PENDING' ? 'pending' : 'running',
          stages: generateStages(p.status),
          commit: `Dernier commit`,
          time: p.last_deployed_at 
            ? new Date(p.last_deployed_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
            : 'En attente',
          progress: p.status === 'PENDING' ? 0 : p.status === 'ACTIVE' ? 100 : 65,
          template_type: p.template_type
        }));
        setPipelines(generatedPipelines);
      }
    } catch (err) {
      console.error('Erreur chargement projets:', err);
      toast.error('Impossible de charger les projets');
    }
  };

  const loadDeployments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/deployments');
      const data = await response.json();
      setDeployments(data);
    } catch (err) {
      console.error('Erreur chargement déploiements:', err);
    }
  };

  const handleDeploy = async (projectId?: string) => {
    const targetProjectId = projectId || selectedProjectId;
    if (!targetProjectId) {
      toast.error('Veuillez sélectionner un projet');
      return;
    }
    
    setIsDeploying(true);
    try {
      const response = await fetch('http://localhost:5000/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: targetProjectId,
          environment: selectedEnv 
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('🚀 Déploiement réussi !', {
          description: `Pipeline exécuté sur ${data.environment || selectedEnv}`,
        });
        
        setTimeout(() => {
          loadAllData();
        }, 1000);
      } else {
        toast.error('Erreur lors du déploiement');
      }
    } catch (err) {
      console.error('Erreur deploy:', err);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRefresh = () => {
    toast.info('Actualisation...');
    loadAllData();
  };

  // Statistiques calculées
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = projects.filter(p => p.status === 'PENDING').length;
  const successDeployments = deployments.filter(d => d.status === 'SUCCESS').length;

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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <CloudUpload className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                SYSTÈME OPÉRATIONNEL
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              CI/CD & Déploiements
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Automatisez vos déploiements et suivez vos pipelines en temps réel
            </p>
          </div>

          {/* Quick Deploy Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 min-w-[320px]"
          >
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Déploiement Rapide
            </h3>
            <div className="space-y-3">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full h-12 rounded-xl bg-white/10 border-white/20 text-white font-medium">
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          project.status === 'ACTIVE' ? 'bg-emerald-500' : 
                          project.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                <SelectTrigger className="w-full h-12 rounded-xl bg-white/10 border-white/20 text-white font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEV">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Development
                    </div>
                  </SelectItem>
                  <SelectItem value="STAGING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      Staging
                    </div>
                  </SelectItem>
                  <SelectItem value="PRODUCTION">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Production
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleDeploy()}
                disabled={isDeploying || !selectedProjectId}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black rounded-xl shadow-xl shadow-blue-500/30 disabled:opacity-50"
              >
                {isDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Déploiement...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    DÉPLOYER
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Projets Actifs', value: activeCount, icon: Layers, color: 'emerald', bg: 'from-emerald-500 to-emerald-600' },
          { label: 'En Attente', value: pendingCount, icon: Clock, color: 'amber', bg: 'from-amber-500 to-orange-500' },
          { label: 'Déploiements', value: deployments.length, icon: CloudUpload, color: 'blue', bg: 'from-blue-500 to-indigo-600' },
          { label: 'Succès', value: successDeployments, icon: CheckCircle2, color: 'purple', bg: 'from-purple-500 to-pink-500' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="p-5 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden relative group hover:shadow-2xl transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg} opacity-5 rounded-bl-full -mr-8 -mt-8 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className={`inline-flex p-2.5 rounded-xl bg-${stat.color}-50 mb-3`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-lg shadow-slate-200/50">
          <button
            onClick={() => setActiveTab('pipelines')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === 'pipelines' 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Pipelines ({pipelines.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === 'history' 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <History className="w-4 h-4 inline mr-2" />
            Historique ({deployments.length})
          </button>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="h-11 px-5 rounded-xl border-slate-200 font-bold"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Pipelines Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'pipelines' && (
          <motion.div
            key="pipelines"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {pipelines.length === 0 ? (
              <Card className="p-16 border-none shadow-xl bg-white text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun pipeline</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Créez un projet et lancez un déploiement pour voir vos pipelines ici.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pipelines.map((pipeline, idx) => (
                  <motion.div 
                    key={pipeline.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden hover:shadow-2xl transition-all group">
                      <div className="flex flex-col lg:flex-row">
                        {/* Left Section - Project Info */}
                        <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-slate-100">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-3 rounded-2xl shrink-0",
                              pipeline.status === 'success' ? "bg-emerald-50 text-emerald-600" :
                              pipeline.status === 'pending' ? "bg-amber-50 text-amber-600" :
                              "bg-blue-50 text-blue-600"
                            )}>
                              {pipeline.status === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                               pipeline.status === 'pending' ? <Clock className="w-6 h-6" /> :
                               <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-black text-slate-900 truncate">{pipeline.project_name}</h3>
                                <Badge className={cn(
                                  "shrink-0 border-none font-bold text-[10px]",
                                  pipeline.status === 'success' ? "bg-emerald-100 text-emerald-700" :
                                  pipeline.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                  "bg-blue-100 text-blue-700"
                                )}>
                                  {pipeline.status === 'success' ? '✓ DÉPLOYÉ' : 
                                   pipeline.status === 'pending' ? '○ EN ATTENTE' : 
                                   '◉ EN COURS'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-slate-400">
                                <span className="flex items-center gap-1 text-xs font-medium">
                                  <GitBranch className="w-3.5 h-3.5" />
                                  {pipeline.branch}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-medium">
                                  <Package className="w-3.5 h-3.5" />
                                  {pipeline.template_type || 'web'}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  {pipeline.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle Section - Stages */}
                        <div className="p-6 flex-1 bg-slate-50/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">PIPELINE</p>
                          <div className="flex items-center gap-2">
                            {pipeline.stages.map((stage, stageIdx) => (
                              <div key={stageIdx} className="flex items-center">
                                <div className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                                  stage.status === 'success' ? "bg-emerald-100 text-emerald-700" :
                                  stage.status === 'running' ? "bg-blue-100 text-blue-700 animate-pulse" :
                                  "bg-slate-100 text-slate-400"
                                )}>
                                  <stage.icon className="w-4 h-4" />
                                  <span className="text-xs font-bold hidden sm:inline">{stage.name}</span>
                                </div>
                                {stageIdx < pipeline.stages.length - 1 && (
                                  <ArrowRight className={cn(
                                    "w-4 h-4 mx-1",
                                    stage.status === 'success' ? "text-emerald-400" : "text-slate-200"
                                  )} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="p-6 flex items-center justify-center lg:w-48 bg-white">
                          {pipeline.status === 'pending' ? (
                            <Button 
                              onClick={() => handleDeploy(pipeline.id)}
                              disabled={isDeploying}
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200"
                            >
                              <Rocket className="w-4 h-4 mr-2" />
                              DÉPLOYER
                            </Button>
                          ) : pipeline.status === 'success' ? (
                            <Button 
                              onClick={() => handleDeploy(pipeline.id)}
                              variant="outline"
                              className="w-full border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              REDÉPLOYER
                            </Button>
                          ) : (
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-xs font-bold text-blue-600">En cours...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-2xl">
              {deployments.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <History className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun historique</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    L'historique des déploiements s'affichera ici après chaque déploiement.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {deployments.map((deployment, idx) => (
                    <motion.div
                      key={deployment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Status Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        deployment.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-600" :
                        deployment.status === 'RUNNING' ? "bg-blue-100 text-blue-600" :
                        "bg-red-100 text-red-600"
                      )}>
                        {deployment.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
                         deployment.status === 'RUNNING' ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> :
                         <XCircle className="w-5 h-5" />}
                      </div>

                      {/* Project & Version */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-slate-900 truncate">{deployment.project_name}</p>
                          <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                            {deployment.version}
                          </code>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{deployment.time_ago}</p>
                      </div>

                      {/* Environment Badge */}
                      <Badge className={cn(
                        "shrink-0 font-bold",
                        deployment.environment === 'PRODUCTION' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        deployment.environment === 'STAGING' ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      )}>
                        <Globe className="w-3 h-3 mr-1" />
                        {deployment.environment}
                      </Badge>

                      {/* Rollback Button */}
                      {deployment.status === 'SUCCESS' && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          onClick={() => toast.info(`Rollback vers ${deployment.version}`)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
