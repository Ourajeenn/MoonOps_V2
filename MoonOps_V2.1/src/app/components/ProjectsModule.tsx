import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Plus,
  Search,
  Globe,
  Smartphone,
  Server,
  Database,
  MoreVertical,
  Filter,
  ExternalLink,
  Github,
  Layers,
  Layout,
  Terminal,
  ChevronRight,
  Code2,
  Cpu,
  Boxes,
  Clock,
  Upload,
  FileArchive,
  X,
  AlertCircle,
  Rocket,
  CheckCircle2,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/app/components/ui/dropdown-menu';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

const templates = [
  { id: 'web', name: 'Application Web', icon: Globe, description: 'React + Node.js + PostgreSQL', color: 'blue' },
  { id: 'mobile', name: 'Application Mobile', icon: Smartphone, description: 'React Native + API REST', color: 'purple' },
  { id: 'api', name: 'API REST', icon: Server, description: 'Node.js + Express + MongoDB', color: 'emerald' },
];

interface Project {
  id: string;
  name: string;
  client_name?: string;
  template_type: string;
  status: string;
  created_at?: string;
  last_deployed_at?: string;
  repository_url?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export function ProjectsModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // Étape du wizard
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [projectToDeploy, setProjectToDeploy] = useState<Project | null>(null);
  const [targetEnv, setTargetEnv] = useState('dev');
  const [isDeploying, setIsDeploying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'MAINTENANCE'>('ALL');

  // Charger les projets au montage
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Erreur chargement projets:', err);
      toast.error('Impossible de charger les projets');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Vérifier que c'est un ZIP
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
        setProjectFile(file);
        toast.success(`Fichier sélectionné: ${file.name}`);
      } else {
        toast.error('Veuillez sélectionner un fichier ZIP');
      }
    }
  };

  const handleQuickDeploy = (project: Project) => {
    setProjectToDeploy(project);
    setDeployDialogOpen(true);
  };

  const handleDeploy = async () => {
    if (!projectToDeploy) return;

    setIsDeploying(true);
    try {
      const response = await fetch('http://localhost:5000/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: projectToDeploy.id,
          environment: targetEnv.toUpperCase()
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('🚀 Déploiement réussi !', {
          description: `${projectToDeploy.name} déployé sur ${targetEnv.toUpperCase()}`,
          action: {
            label: '📊 Voir CI/CD',
            onClick: () => {
              // Navigation vers CI/CD - on utilise un événement custom
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'cicd' }));
            }
          },
          duration: 5000
        });
        setDeployDialogOpen(false);
        setProjectToDeploy(null);
        // Recharger les projets pour voir le changement de statut
        await loadProjects();
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

  const handleDeleteProject = async (project: Project) => {
    // Demander confirmation
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Projet supprimé', {
          description: `${project.name} a été supprimé avec succès`
        });
        // Recharger la liste
        await loadProjects();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur de connexion au serveur');
    }
  };

  const handleCreateProject = async () => {
    if (!projectName || !selectedTemplate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier qu'il y a au moins une source (Git OU ZIP)
    if (!gitUrl && !projectFile) {
      toast.error('Veuillez fournir une URL Git OU un fichier ZIP');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      let createdProjectName = projectName;
      
      // Si un fichier est fourni, utiliser FormData
      if (projectFile) {
        const formData = new FormData();
        formData.append('name', projectName);
        formData.append('template_type', selectedTemplate);
        formData.append('file', projectFile);
        if (gitUrl) formData.append('git_url', gitUrl);

        response = await fetch('http://localhost:5000/api/projects/upload', {
          method: 'POST',
          body: formData
        });
      } else {
        // Sans fichier, utiliser JSON avec URL Git
        response = await fetch('http://localhost:5000/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            template_type: selectedTemplate,
            description: `Projet ${selectedTemplate}`,
            repository_url: gitUrl
          })
        });
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Fermer le dialog et reset
        setIsCreateDialogOpen(false);
        setProjectName('');
        setSelectedTemplate('');
        setGitUrl('');
        setProjectFile(null);
        
        // Recharger les projets d'abord
        const projectsRes = await fetch('http://localhost:5000/api/projects');
        const updatedProjects = await projectsRes.json();
        setProjects(updatedProjects);
        
        // Trouver le projet créé par son ID
        const newProject = data.project_id 
          ? updatedProjects.find((p: Project) => p.id === data.project_id)
          : updatedProjects.find((p: Project) => p.name === createdProjectName);
        
        // Toast avec action de déploiement
        toast.success(data.message, {
          description: projectFile ? `Fichier ${projectFile.name} uploadé` : 'Projet en attente de déploiement',
          action: newProject ? {
            label: '🚀 Déployer',
            onClick: () => {
              setProjectToDeploy(newProject);
              setDeployDialogOpen(true);
            }
          } : undefined,
          duration: 6000
        });
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error('Erreur création projet:', err);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer par statut puis par recherche
  const statusFilteredProjects = filterStatus === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  const filteredProjects = statusFilteredProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client_name && project.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Compter par statut
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = projects.filter(p => p.status === 'PENDING').length;
  const maintenanceCount = projects.filter(p => p.status === 'MAINTENANCE').length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-full"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            Projets
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-3 ml-1">
            <Boxes className="w-4 h-4 text-blue-500" />
            Plateforme Multi-tenant - {projects.length} projet{projects.length > 1 ? 's' : ''} configuré{projects.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une instance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium w-72"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              // Reset wizard when closing
              setWizardStep(1);
              setProjectName('');
              setSelectedTemplate('');
              setGitUrl('');
              setProjectFile(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-xl shadow-blue-500/30 gap-2 transition-all hover:scale-105">
                <Plus size={20} />
                Nouveau Projet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
              {/* Header with progress */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <Rocket className="w-6 h-6" />
                  Nouveau Projet
                </DialogTitle>
                
                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`h-1.5 rounded-full flex-1 transition-all ${
                        step <= wizardStep ? 'bg-white' : 'bg-white/30'
                      }`} />
                      {step < 3 && <div className="w-2" />}
                    </div>
                  ))}
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  Étape {wizardStep} sur 3
                </p>
              </div>

              <div className="p-6 min-h-[400px]">
                {/* ÉTAPE 1 : Nom & Type */}
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Informations du projet</h3>
                      <p className="text-sm text-slate-500">Commencez par nommer votre projet et choisir son type</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Nom du Projet *</Label>
                      <Input 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="rounded-lg border-2 border-slate-200 h-12 font-semibold focus:border-blue-500" 
                        placeholder="E-Commerce Moonlight" 
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700">Type d'Application *</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {templates.map((t) => {
                          const Icon = t.icon;
                          const isActive = selectedTemplate === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedTemplate(t.id)}
                              className={cn(
                                "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                                isActive
                                  ? "bg-blue-500 border-blue-600 text-white"
                                  : "bg-white border-slate-200 hover:border-blue-300 text-slate-600"
                              )}
                            >
                              <Icon className={cn("w-7 h-7 mb-2", isActive ? "text-white" : "text-slate-400")} />
                              <span className="font-bold text-xs">{t.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : Source du Code */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Source du code</h3>
                      <p className="text-sm text-slate-500">Fournissez l'URL Git ou uploadez une archive ZIP</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">URL Git</Label>
                      <Input 
                        value={gitUrl}
                        onChange={(e) => setGitUrl(e.target.value)}
                        className="rounded-lg border-2 border-slate-200 h-12 font-mono text-sm focus:border-blue-500" 
                        placeholder="https://github.com/user/repo.git" 
                      />
                    </div>

                    <div className="relative flex items-center">
                      <div className="flex-1 border-t border-slate-300"></div>
                      <span className="px-3 text-xs font-bold text-slate-400">OU</span>
                      <div className="flex-1 border-t border-slate-300"></div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Archive ZIP</Label>
                      <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer",
                        projectFile ? "bg-blue-50 border-blue-400" : "bg-slate-50 border-slate-300 hover:border-blue-400"
                      )}>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="hidden"
                          id="project-file-upload"
                        />
                        <label htmlFor="project-file-upload" className="cursor-pointer block">
                          {projectFile ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileArchive className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-bold text-sm">{projectFile.name}</p>
                                  <p className="text-xs text-slate-500">{(projectFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setProjectFile(null);
                                }}
                                className="p-1 hover:bg-blue-200 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Upload className="w-5 h-5 text-slate-400" />
                              <p className="text-sm text-slate-600">Cliquer pour sélectionner un fichier</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {!gitUrl && !projectFile && (
                      <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Au moins une source requise</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ÉTAPE 3 : Récapitulatif */}
                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Récapitulatif</h3>
                      <p className="text-sm text-slate-500">Vérifiez les informations avant de créer le projet</p>
                    </div>

                    <div className="space-y-4 bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Nom du projet</span>
                        <span className="font-bold">{projectName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Type</span>
                        <Badge>{templates.find(t => t.id === selectedTemplate)?.name}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Source</span>
                        <div className="flex items-center gap-2">
                          {gitUrl && <Badge variant="outline"><Github className="w-3 h-3 mr-1" />Git</Badge>}
                          {projectFile && <Badge variant="outline"><FileArchive className="w-3 h-3 mr-1" />ZIP</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-slate-200 flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => wizardStep === 1 ? setIsCreateDialogOpen(false) : setWizardStep(wizardStep - 1)}
                  className="rounded-lg"
                >
                  {wizardStep === 1 ? 'Annuler' : 'Précédent'}
                </Button>
                
                <Button
                  onClick={() => {
                    if (wizardStep === 3) {
                      handleCreateProject();
                    } else if (wizardStep === 1 && projectName && selectedTemplate) {
                      setWizardStep(2);
                    } else if (wizardStep === 2 && (gitUrl || projectFile)) {
                      setWizardStep(3);
                    } else {
                      toast.error('Veuillez remplir tous les champs requis');
                    }
                  }}
                  disabled={
                    (wizardStep === 1 && (!projectName || !selectedTemplate)) ||
                    (wizardStep === 2 && !gitUrl && !projectFile) ||
                    (wizardStep === 3 && isLoading)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
                >
                  {wizardStep === 3 ? (isLoading ? 'Création...' : 'Créer') : 'Suivant'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects List Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50 overflow-hidden rounded-3xl">
          <div className="p-8 border-b-2 border-slate-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  Projets Déployés
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Applications multi-tenant avec environnements isolés</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none font-bold px-4 py-2 uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-200">
                    {activeCount} LIVE
                  </Badge>
                </div>
                {pendingCount > 0 && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none font-bold px-4 py-2 uppercase tracking-widest text-[11px] shadow-lg shadow-amber-200">
                    {pendingCount} EN ATTENTE
                  </Badge>
                )}
              </div>
            </div>

            {/* Onglets de filtrage */}
            <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <TabsList className="bg-gradient-to-r from-slate-100 to-slate-200 p-1.5 rounded-2xl shadow-inner">
                <TabsTrigger value="ALL" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold px-6 py-2.5">
                  Tous ({projects.length})
                </TabsTrigger>
                <TabsTrigger value="ACTIVE" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold px-6 py-2.5">
                  Actifs ({activeCount})
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold px-6 py-2.5">
                  En attente ({pendingCount})
                </TabsTrigger>
                {maintenanceCount > 0 && (
                  <TabsTrigger value="MAINTENANCE" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold px-6 py-2.5">
                    Maintenance ({maintenanceCount})
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="py-5 px-8 text-xs font-black text-slate-600 uppercase tracking-wider">Projet</th>
                  <th className="py-5 px-8 text-xs font-black text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="py-5 px-8 text-xs font-black text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="py-5 px-8 text-xs font-black text-slate-600 uppercase tracking-wider">Source</th>
                  <th className="py-5 px-8 text-xs font-black text-slate-600 uppercase tracking-wider">Dernier Déploiement</th>
                  <th className="py-5 px-8 text-xs font-black text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredProjects.map((p) => {
                    const lastDeploy = p.last_deployed_at 
                      ? new Date(p.last_deployed_at).toLocaleString('fr-FR', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'Jamais';
                    
                    const isGit = p.repository_url?.startsWith('http');
                    
                    return (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                        className="group transition-all"
                      >
                        {/* Nom du Projet */}
                        <td className="py-6 px-8">
                          <div>
                            <p className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                              {p.name}
                              {p.status === 'PENDING' && (
                                <Badge className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5">
                                  <AlertCircle size={10} className="mr-1" />
                                  À DÉPLOYER
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Client: {p.client_name || 'TechConsulting'}</p>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2">
                            {p.template_type === 'web' && <Globe size={16} className="text-blue-500" />}
                            {p.template_type === 'mobile' && <Smartphone size={16} className="text-purple-500" />}
                            {p.template_type === 'api' && <Server size={16} className="text-emerald-500" />}
                            <span className="font-bold text-sm text-slate-700 capitalize">{p.template_type}</span>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full",
                              p.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                p.status === 'PENDING' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" : 
                                "bg-slate-300"
                            )} />
                            <Badge className={cn(
                              "font-bold text-xs",
                              p.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700" :
                                p.status === 'PENDING' ? "bg-amber-50 text-amber-700" :
                                "bg-slate-100 text-slate-600"
                            )}>
                              {p.status === 'ACTIVE' ? 'En ligne' : 
                               p.status === 'PENDING' ? 'En attente' : p.status}
                            </Badge>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="py-6 px-8">
                          {p.repository_url ? (
                            <div className="flex items-center gap-2">
                              {isGit ? (
                                <>
                                  <Github size={14} className="text-slate-400" />
                                  <span className="text-xs font-medium text-slate-600">Git</span>
                                </>
                              ) : (
                                <>
                                  <FileArchive size={14} className="text-slate-400" />
                                  <span className="text-xs font-medium text-slate-600">ZIP</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>

                        {/* Dernier Déploiement */}
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <Clock size={12} />
                            {lastDeploy}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-6 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.status === 'PENDING' && (
                              <Button 
                                onClick={() => handleQuickDeploy(p)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                <Rocket size={14} />
                                Déployer
                              </Button>
                            )}
                            <Button 
                              onClick={() => handleDeleteProject(p)}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Dialog de déploiement */}
      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Déployer {projectToDeploy?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Environnement cible
              </Label>
              <RadioGroup value={targetEnv} onValueChange={setTargetEnv} className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="dev" id="dev" />
                  <Label htmlFor="dev" className="flex-1 cursor-pointer">
                    <span className="font-bold text-slate-900">Development</span>
                    <p className="text-xs text-slate-500">Environnement de développement</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="staging" id="staging" />
                  <Label htmlFor="staging" className="flex-1 cursor-pointer">
                    <span className="font-bold text-slate-900">Staging</span>
                    <p className="text-xs text-slate-500">Pré-production pour tests</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="prod" id="prod" />
                  <Label htmlFor="prod" className="flex-1 cursor-pointer">
                    <span className="font-bold text-slate-900">Production</span>
                    <p className="text-xs text-slate-500">Environnement de production</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setDeployDialogOpen(false)}
                className="flex-1 rounded-2xl font-bold"
              >
                ANNULER
              </Button>
              <Button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl disabled:opacity-50"
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    DÉPLOIEMENT...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Rocket size={16} />
                    LANCER LE PIPELINE
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
