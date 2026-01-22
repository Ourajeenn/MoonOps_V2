import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Settings,
  Users,
  Building,
  Shield,
  Key,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

// Données simulées pour l'administration
const users = [
  {
    id: 'user-001',
    email: 'admin@techconsulting.fr',
    full_name: 'System Admin',
    role: 'SUPERADMIN',
    client_id: 'e1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d',
    client_name: 'TechConsulting Gp',
    is_active: true,
    last_login: '2026-01-22T14:30:00Z',
    created_at: '2026-01-01T00:00:00Z',
    login_attempts: 0,
    two_factor_enabled: true
  },
  {
    id: 'user-002',
    email: 'alice.martin@techconsulting.fr',
    full_name: 'Alice Martin',
    role: 'ADMIN',
    client_id: 'e1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d',
    client_name: 'TechConsulting Gp',
    is_active: true,
    last_login: '2026-01-22T09:15:00Z',
    created_at: '2026-01-05T00:00:00Z',
    login_attempts: 0,
    two_factor_enabled: false
  },
  {
    id: 'user-003',
    email: 'jean.dupont@client.fr',
    full_name: 'Jean Dupont',
    role: 'DEVELOPER',
    client_id: 'client-uuid-001',
    client_name: 'E-Commerce Corp',
    is_active: true,
    last_login: '2026-01-21T16:45:00Z',
    created_at: '2026-01-10T00:00:00Z',
    login_attempts: 2,
    two_factor_enabled: true
  },
  {
    id: 'user-004',
    email: 'marie.leroy@client.fr',
    full_name: 'Marie Leroy',
    role: 'VIEWER',
    client_id: 'client-uuid-001',
    client_name: 'E-Commerce Corp',
    is_active: true,
    last_login: '2026-01-20T11:30:00Z',
    created_at: '2026-01-12T00:00:00Z',
    login_attempts: 0,
    two_factor_enabled: false
  }
];

const clients = [
  {
    id: 'e1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'TechConsulting Gp',
    slug: 'techconsulting',
    website: 'https://techconsulting.fr',
    industry: 'Technology Consulting',
    size: '50-200',
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    user_count: 15,
    project_count: 8,
    billing_status: 'PAID'
  },
  {
    id: 'client-uuid-001',
    name: 'E-Commerce Corp',
    slug: 'ecommerce-corp',
    website: 'https://ecommerce-corp.com',
    industry: 'E-commerce',
    size: '200-1000',
    status: 'ACTIVE',
    created_at: '2026-01-10T00:00:00Z',
    user_count: 45,
    project_count: 12,
    billing_status: 'PAID'
  },
  {
    id: 'client-uuid-002',
    name: 'Finance Solutions',
    slug: 'finance-solutions',
    website: 'https://finance-solutions.com',
    industry: 'Financial Services',
    size: '1000+',
    status: 'SUSPENDED',
    created_at: '2026-01-15T00:00:00Z',
    user_count: 120,
    project_count: 25,
    billing_status: 'OVERDUE'
  }
];

const auditLogs = [
  {
    id: 'audit-001',
    timestamp: '2026-01-22T14:30:00Z',
    actor: 'admin@techconsulting.fr',
    action: 'LOGIN',
    resource_type: 'AUTH',
    resource_id: 'user-001',
    details: 'Connexion réussie depuis 192.168.1.100',
    severity: 'INFO'
  },
  {
    id: 'audit-002',
    timestamp: '2026-01-22T14:15:00Z',
    actor: 'alice.martin@techconsulting.fr',
    action: 'CREATE_PROJECT',
    resource_type: 'PROJECT',
    resource_id: 'p4-uuid-demo',
    details: 'Création du projet "Data Analytics Dashboard"',
    severity: 'INFO'
  },
  {
    id: 'audit-003',
    timestamp: '2026-01-22T14:00:00Z',
    actor: 'jean.dupont@client.fr',
    action: 'DEPLOY',
    resource_type: 'DEPLOYMENT',
    resource_id: 'deploy-001',
    details: 'Déploiement en production du projet E-Commerce',
    severity: 'INFO'
  },
  {
    id: 'audit-004',
    timestamp: '2026-01-22T13:45:00Z',
    actor: 'system@moonops.app',
    action: 'SECURITY_SCAN',
    resource_type: 'SYSTEM',
    resource_id: 'scan-001',
    details: 'Scan de sécurité terminé - 2 vulnérabilités trouvées',
    severity: 'WARNING'
  }
];

const systemStats = {
  total_users: users.length,
  active_users: users.filter(u => u.is_active).length,
  total_clients: clients.length,
  active_clients: clients.filter(c => c.status === 'ACTIVE').length,
  total_projects: 25,
  system_uptime: '99.9%',
  database_size: '2.4 GB',
  last_backup: '2026-01-22T02:00:00Z'
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

export function AdminModule() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'text-rose-600 bg-rose-100';
      case 'ADMIN': return 'text-purple-600 bg-purple-100';
      case 'DEVELOPER': return 'text-blue-600 bg-blue-100';
      case 'VIEWER': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-600 bg-emerald-100';
      case 'SUSPENDED': return 'text-amber-600 bg-amber-100';
      case 'INACTIVE': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-rose-600';
      case 'WARNING': return 'text-amber-600';
      case 'INFO': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log =>
    log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            Administration
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-3 ml-1">
            <Shield className="w-4 h-4 text-slate-600" />
            Gestion Système - Utilisateurs & Clients
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 w-72 bg-white border-slate-200 rounded-xl font-medium"
            />
          </div>

          <Button
            onClick={() => toast.success('Configuration exportée !')}
            variant="outline"
            className="border-slate-200 font-bold rounded-xl gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-blue-600">{systemStats.total_users}</div>
                <div className="text-sm text-blue-600 font-medium">Utilisateurs</div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-emerald-600">{systemStats.active_clients}</div>
                <div className="text-sm text-emerald-600 font-medium">Clients Actifs</div>
              </div>
              <Building className="w-8 h-8 text-emerald-400" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-purple-600">{systemStats.total_projects}</div>
                <div className="text-sm text-purple-600 font-medium">Projets</div>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-amber-600">{systemStats.system_uptime}</div>
                <div className="text-sm text-amber-600 font-medium">Disponibilité</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-amber-400" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="users" className="rounded-lg font-bold px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="clients" className="rounded-lg font-bold px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Building className="w-4 h-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg font-bold px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg font-bold px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Système
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Gestion des Utilisateurs</h3>
                    <p className="text-sm text-slate-400 font-medium">Créer, modifier et gérer les comptes utilisateur</p>
                  </div>

                  <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2">
                        <UserPlus className="w-4 h-4" />
                        Nouvel Utilisateur
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                          <UserPlus className="w-6 h-6" />
                          Créer un Utilisateur
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-bold text-slate-700">Nom complet</label>
                          <Input className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold" placeholder="Jean Dupont" />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700">Email</label>
                          <Input type="email" className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold" placeholder="jean@company.com" />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700">Rôle</label>
                          <Select>
                            <SelectTrigger className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold">
                              <SelectValue placeholder="Sélectionner un rôle..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VIEWER">Viewer</SelectItem>
                              <SelectItem value="DEVELOPER">Developer</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700">Client</label>
                          <Select>
                            <SelectTrigger className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold">
                              <SelectValue placeholder="Sélectionner un client..." />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id} className="font-bold">
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button variant="ghost" onClick={() => setIsCreateUserDialogOpen(false)} className="flex-1 rounded-xl font-bold">
                            Annuler
                          </Button>
                          <Button onClick={() => { toast.success('Utilisateur créé !'); setIsCreateUserDialogOpen(false); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                            Créer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Utilisateur</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Rôle</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Client</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Statut</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Dernière Connexion</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-slate-900">{user.full_name}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={cn("font-bold text-xs px-3 py-1", getRoleColor(user.role))}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-slate-700">{user.client_name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              user.is_active ? "bg-emerald-500" : "bg-slate-300"
                            )} />
                            <Badge className={cn("font-bold text-xs px-3 py-1", getStatusColor(user.is_active ? 'ACTIVE' : 'INACTIVE'))}>
                              {user.is_active ? 'ACTIF' : 'INACTIF'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-slate-600">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="font-bold text-slate-600 hover:text-slate-900">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className={cn(
                              "font-bold",
                              user.is_active ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                            )}>
                              {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="font-bold text-rose-600 hover:text-rose-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Gestion des Clients</h3>
                    <p className="text-sm text-slate-400 font-medium">Administration des tenants multi-tenant</p>
                  </div>

                  <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2">
                        <Building2 className="w-4 h-4" />
                        Nouveau Client
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                          <Building2 className="w-6 h-6" />
                          Créer un Client
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-bold text-slate-700">Nom de l'entreprise</label>
                          <Input className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold" placeholder="ACME Corp" />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700">Site web</label>
                          <Input type="url" className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold" placeholder="https://acme.com" />
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700">Secteur d'activité</label>
                          <Select>
                            <SelectTrigger className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold">
                              <SelectValue placeholder="Sélectionner un secteur..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technologie</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="retail">Commerce</SelectItem>
                              <SelectItem value="healthcare">Santé</SelectItem>
                              <SelectItem value="manufacturing">Industrie</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-700">Taille d'entreprise</label>
                          <Select>
                            <SelectTrigger className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold">
                              <SelectValue placeholder="Sélectionner la taille..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employés</SelectItem>
                              <SelectItem value="11-50">11-50 employés</SelectItem>
                              <SelectItem value="51-200">51-200 employés</SelectItem>
                              <SelectItem value="201-1000">201-1000 employés</SelectItem>
                              <SelectItem value="1000+">1000+ employés</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button variant="ghost" onClick={() => setIsCreateClientDialogOpen(false)} className="flex-1 rounded-xl font-bold">
                            Annuler
                          </Button>
                          <Button onClick={() => { toast.success('Client créé !'); setIsCreateClientDialogOpen(false); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                            Créer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Client</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Secteur</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Statistiques</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Statut</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((client, i) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                            <div className="text-sm text-slate-500">{client.website}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-slate-700">{client.industry}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">
                              <Users className="w-3 h-3 inline mr-1" />
                              {client.user_count} utilisateurs
                            </div>
                            <div className="text-xs text-slate-500">
                              <Activity className="w-3 h-3 inline mr-1" />
                              {client.project_count} projets
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={cn("font-bold text-xs px-3 py-1", getStatusColor(client.status))}>
                            {client.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="font-bold text-slate-600 hover:text-slate-900">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="font-bold text-slate-600 hover:text-slate-900">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="mt-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Logs d'Audit</h3>
                    <p className="text-sm text-slate-400 font-medium">Historique des actions système et utilisateur</p>
                  </div>

                  <Button
                    onClick={() => toast.success('Logs exportés !')}
                    variant="outline"
                    className="border-slate-200 font-bold rounded-xl gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter Logs
                  </Button>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-slate-100">
                  {filteredAuditLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="p-6 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            getSeverityColor(log.severity) === 'text-rose-600' ? "bg-rose-100" :
                            getSeverityColor(log.severity) === 'text-amber-600' ? "bg-amber-100" :
                            "bg-blue-100"
                          )}>
                            {log.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-rose-600" /> :
                             log.severity === 'WARNING' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                             <Activity className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-900">{log.action}</span>
                              <Badge className={cn("text-[10px] px-2 py-0.5 font-bold", getSeverityColor(log.severity) + " bg-opacity-20")}>
                                {log.severity}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{log.details}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="font-mono">{log.resource_type}:{log.resource_id}</span>
                              <span>•</span>
                              <span>{log.actor}</span>
                              <span>•</span>
                              <span>{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <h3 className="text-xl font-black mb-6">Configuration Système</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div>
                      <div className="font-bold text-white">Base de données</div>
                      <div className="text-sm text-slate-300">{systemStats.database_size}</div>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurer
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div>
                      <div className="font-bold text-white">Sauvegarde</div>
                      <div className="text-sm text-slate-300">
                        Dernière: {new Date(systemStats.last_backup).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div>
                      <div className="font-bold text-white">Mises à jour</div>
                      <div className="text-sm text-slate-300">Système à jour</div>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold">
                      <Upload className="w-4 h-4 mr-2" />
                      Mettre à jour
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white">
                <h3 className="text-xl font-black text-slate-900 mb-6">Métriques Système</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Disponibilité</span>
                    <span className="text-2xl font-black text-emerald-600">{systemStats.system_uptime}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Utilisateurs actifs</span>
                    <span className="text-2xl font-black text-blue-600">{systemStats.active_users}/{systemStats.total_users}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Clients actifs</span>
                    <span className="text-2xl font-black text-purple-600">{systemStats.active_clients}/{systemStats.total_clients}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Total projets</span>
                    <span className="text-2xl font-black text-amber-600">{systemStats.total_projects}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}