import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import {
  MessageSquare,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  ArrowUpRight,
  RefreshCw,
  Send,
  Paperclip,
  Star,
  ThumbsUp,
  Zap
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

// Données simulées pour le HelpDesk
const tickets = [
  {
    id: 'HD-2026-001',
    title: 'Problème de déploiement en production',
    description: 'Le dernier déploiement de l\'e-commerce a échoué avec une erreur 502',
    priority: 'HIGH',
    status: 'OPEN',
    type: 'INCIDENT',
    requester: 'Jean Dupont',
    email: 'jean.dupont@client.fr',
    assigned_to: 'Alice Martin',
    created_at: '2026-01-22T09:15:00Z',
    updated_at: '2026-01-22T14:30:00Z',
    tags: ['production', 'deployment', 'urgent'],
    messages: [
      {
        id: 'msg-1',
        author: 'Jean Dupont',
        content: 'Bonjour, nous rencontrons un problème avec le déploiement en production. L\'application retourne une erreur 502.',
        timestamp: '2026-01-22T09:15:00Z',
        attachments: []
      },
      {
        id: 'msg-2',
        author: 'Alice Martin',
        content: 'Je regarde le problème. Les logs montrent une erreur de connexion à la base de données.',
        timestamp: '2026-01-22T09:30:00Z',
        attachments: []
      }
    ]
  },
  {
    id: 'HD-2026-002',
    title: 'Demande d\'accès au monitoring',
    description: 'Besoin d\'accès en lecture seule aux métriques de performance',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    type: 'REQUEST',
    requester: 'Marie Leroy',
    email: 'marie.leroy@client.fr',
    assigned_to: 'Bob Wilson',
    created_at: '2026-01-21T16:45:00Z',
    updated_at: '2026-01-22T11:20:00Z',
    tags: ['access', 'monitoring'],
    messages: [
      {
        id: 'msg-3',
        author: 'Marie Leroy',
        content: 'Pouvez-vous me donner accès aux dashboards de monitoring pour suivre les performances de nos applications ?',
        timestamp: '2026-01-21T16:45:00Z',
        attachments: []
      }
    ]
  },
  {
    id: 'HD-2026-003',
    title: 'Maintenance programmée - Migration DB',
    description: 'Migration de la base de données vers PostgreSQL 15',
    priority: 'LOW',
    status: 'RESOLVED',
    type: 'MAINTENANCE',
    requester: 'System Admin',
    email: 'admin@techconsulting.fr',
    assigned_to: 'Charlie Brown',
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-01-21T17:30:00Z',
    tags: ['maintenance', 'database', 'migration'],
    messages: [
      {
        id: 'msg-4',
        author: 'System Admin',
        content: 'Migration de la base de données vers PostgreSQL 15 programmée pour ce soir.',
        timestamp: '2026-01-20T08:00:00Z',
        attachments: []
      },
      {
        id: 'msg-5',
        author: 'Charlie Brown',
        content: 'Migration terminée avec succès. Tous les tests passent.',
        timestamp: '2026-01-21T17:30:00Z',
        attachments: []
      }
    ]
  },
  {
    id: 'HD-2026-004',
    title: 'Configuration SSL pour nouveau domaine',
    description: 'Besoin de configurer le certificat SSL pour api.nouveauclient.com',
    priority: 'MEDIUM',
    status: 'OPEN',
    type: 'REQUEST',
    requester: 'Pierre Durand',
    email: 'pierre.durand@nouveauclient.com',
    assigned_to: null,
    created_at: '2026-01-22T13:20:00Z',
    updated_at: '2026-01-22T13:20:00Z',
    tags: ['ssl', 'certificate', 'domain'],
    messages: [
      {
        id: 'msg-6',
        author: 'Pierre Durand',
        content: 'Nous avons besoin de configurer un certificat SSL pour notre nouveau domaine API.',
        timestamp: '2026-01-22T13:20:00Z',
        attachments: ['certificat.csr', 'instructions.pdf']
      }
    ]
  }
];

const stats = {
  total: tickets.length,
  open: tickets.filter(t => t.status === 'OPEN').length,
  in_progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
  resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  avg_response_time: '2h 15m',
  satisfaction_score: 4.8
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

export function HelpDeskModule() {
  const [selectedTicket, setSelectedTicket] = useState<typeof tickets[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.requester.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-600 bg-rose-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-100';
      case 'LOW': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-rose-600 bg-rose-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'RESOLVED': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCIDENT': return 'text-rose-600 bg-rose-50';
      case 'REQUEST': return 'text-blue-600 bg-blue-50';
      case 'MAINTENANCE': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    toast.success('Message envoyé !');
    setNewMessage('');
  };

  const handleCreateTicket = () => {
    toast.success('Nouveau ticket créé !');
    setIsCreateDialogOpen(false);
  };

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
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            HelpDesk
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-3 ml-1">
            <MessageCircle className="w-4 h-4 text-cyan-500" />
            Support Client - Tickets & Assistance 24/7
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 w-72 bg-white border-slate-200 rounded-xl font-medium"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-40 bg-white border-slate-200 rounded-xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="font-bold">Tous</SelectItem>
              <SelectItem value="OPEN" className="font-bold">Ouverts</SelectItem>
              <SelectItem value="IN_PROGRESS" className="font-bold">En cours</SelectItem>
              <SelectItem value="RESOLVED" className="font-bold">Résolus</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xl gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <MessageSquare className="w-6 h-6" />
                  Créer un Nouveau Ticket
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">Titre du ticket</label>
                    <Input className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold" placeholder="Résumez votre problème..." />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">Description</label>
                    <Textarea className="mt-2 rounded-lg border-2 border-slate-200 min-h-[120px] font-medium" placeholder="Décrivez votre problème en détail..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-700">Priorité</label>
                      <Select>
                        <SelectTrigger className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Basse</SelectItem>
                          <SelectItem value="MEDIUM">Moyenne</SelectItem>
                          <SelectItem value="HIGH">Haute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700">Type</label>
                      <Select>
                        <SelectTrigger className="mt-2 rounded-lg border-2 border-slate-200 h-12 font-semibold">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INCIDENT">Incident</SelectItem>
                          <SelectItem value="REQUEST">Demande</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 rounded-xl font-bold">
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTicket} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold">
                    Créer le Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-500 font-medium">Total Tickets</div>
              </div>
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-rose-50 to-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-rose-600">{stats.open}</div>
                <div className="text-sm text-rose-600 font-medium">Ouverts</div>
              </div>
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-blue-600">{stats.in_progress}</div>
                <div className="text-sm text-blue-600 font-medium">En Cours</div>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-emerald-600">{stats.resolved}</div>
                <div className="text-sm text-emerald-600 font-medium">Résolus</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Tickets List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Tickets ({filteredTickets.length})</h3>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {filteredTickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-slate-50 transition-colors",
                      selectedTicket?.id === ticket.id && "bg-blue-50 border-l-4 border-blue-500"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-bold text-slate-900 text-sm truncate flex-1">
                        {ticket.title}
                      </div>
                      <Badge className={cn("text-[10px] px-2 py-0.5 font-bold shrink-0", getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                      </Badge>
                    </div>

                    <p className="text-slate-600 text-xs mb-3 line-clamp-2">{ticket.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[10px] px-2 py-0.5 font-bold", getStatusColor(ticket.status))}>
                          {ticket.status}
                        </Badge>
                        <Badge className={cn("text-[10px] px-2 py-0.5 font-bold", getTypeColor(ticket.type))}>
                          {ticket.type}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-400">
                        {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {ticket.assigned_to && (
                      <div className="flex items-center gap-1 mt-2">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{ticket.assigned_to}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Ticket Detail */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden min-h-[600px]">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900">{selectedTicket.title}</h3>
                        <Badge className={cn("font-bold px-3 py-1", getPriorityColor(selectedTicket.priority))}>
                          {selectedTicket.priority}
                        </Badge>
                        <Badge className={cn("font-bold px-3 py-1", getStatusColor(selectedTicket.status))}>
                          {selectedTicket.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="font-mono">{selectedTicket.id}</span>
                        <span>•</span>
                        <span>{selectedTicket.type}</span>
                        <span>•</span>
                        <span>{new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="font-bold">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Mettre à jour
                      </Button>
                      <Button variant="outline" size="sm" className="font-bold">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Résoudre
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Demandeur</div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900">{selectedTicket.requester}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{selectedTicket.email}</span>
                      </div>
                    </div>

                    {selectedTicket.assigned_to && (
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Assigné à</div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-900">{selectedTicket.assigned_to}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedTicket.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      <Tag className="w-4 h-4 text-slate-400" />
                      {selectedTicket.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 max-h-[400px] overflow-y-auto p-6">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message, i) => (
                      <div key={message.id} className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">{message.author}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(message.timestamp).toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-slate-700 bg-slate-50 rounded-lg p-3">{message.content}</p>
                          {message.attachments.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {message.attachments.map((attachment, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <div className="p-6 border-t border-slate-100">
                  <div className="space-y-4">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre réponse..."
                      className="min-h-[80px] rounded-lg border-2 border-slate-200"
                    />

                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="font-bold gap-2">
                        <Paperclip className="w-4 h-4" />
                        Joindre un fichier
                      </Button>

                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Sélectionnez un ticket</h3>
                  <p className="text-slate-500">Cliquez sur un ticket pour voir les détails</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Actions Rapides</h3>
              <p className="text-slate-600 font-medium">Outils et raccourcis fréquemment utilisés</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto py-6 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border-2 border-slate-200 gap-3">
              <Zap className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold">Escalader</div>
                <div className="text-xs text-slate-500">Priorité haute</div>
              </div>
            </Button>

            <Button className="h-auto py-6 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border-2 border-slate-200 gap-3">
              <ThumbsUp className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold">Satisfait</div>
                <div className="text-xs text-slate-500">Feedback positif</div>
              </div>
            </Button>

            <Button className="h-auto py-6 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border-2 border-slate-200 gap-3">
              <Star className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold">Base de Connaissances</div>
                <div className="text-xs text-slate-500">Solutions communes</div>
              </div>
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}