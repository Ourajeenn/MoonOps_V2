import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Server,
  Globe,
  Database,
  Key,
  FileText,
  Terminal,
  Wifi,
  Cpu
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

// Données simulées pour la sécurité
const securityScan = {
  overall: {
    score: 92,
    status: 'SECURE',
    lastScan: '2026-01-22T14:30:00Z',
    nextScan: '2026-01-23T14:30:00Z'
  },
  vulnerabilities: [
    {
      id: 'VULN-001',
      severity: 'HIGH',
      title: 'OpenSSL Heartbleed Vulnerability',
      description: 'Critical buffer over-read in OpenSSL affecting TLS heartbeat extension',
      cve: 'CVE-2014-0160',
      affected: ['web-server-01', 'api-gateway-02'],
      status: 'PATCHED',
      patchedDate: '2026-01-20T10:15:00Z'
    },
    {
      id: 'VULN-002',
      severity: 'MEDIUM',
      title: 'Weak SSL Configuration',
      description: 'SSL/TLS configuration allows weak cipher suites',
      cve: 'N/A',
      affected: ['load-balancer-01'],
      status: 'IN_PROGRESS',
      patchedDate: null
    },
    {
      id: 'VULN-003',
      severity: 'LOW',
      title: 'Outdated Dependencies',
      description: 'Several npm packages are outdated and may contain security issues',
      cve: 'Multiple',
      affected: ['frontend-app', 'admin-panel'],
      status: 'OPEN',
      patchedDate: null
    }
  ],
  compliance: {
    pci_dss: { score: 98, status: 'COMPLIANT' },
    gdpr: { score: 95, status: 'COMPLIANT' },
    soc2: { score: 89, status: 'AT_RISK' },
    iso27001: { score: 92, status: 'COMPLIANT' }
  },
  access: {
    active_sessions: 24,
    failed_attempts: 3,
    locked_accounts: 1,
    recent_logins: [
      { user: 'admin@techconsulting.fr', ip: '192.168.1.100', time: '5 min ago', status: 'SUCCESS' },
      { user: 'dev@techconsulting.fr', ip: '10.0.0.50', time: '12 min ago', status: 'SUCCESS' },
      { user: 'unknown', ip: '203.0.113.45', time: '1h ago', status: 'FAILED' }
    ]
  },
  firewall: {
    rules: 127,
    blocked_ips: 45,
    active_connections: 892,
    threats_blocked: 12
  }
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

export function SecurityModule() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showSensitive, setShowSensitive] = useState(false);

  const handleSecurityScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    toast.info('Lancement du scan de sécurité...');

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          toast.success('Scan de sécurité terminé !');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-100';
      case 'LOW': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SECURE':
      case 'COMPLIANT':
      case 'PATCHED': return 'text-emerald-600 bg-emerald-100';
      case 'AT_RISK':
      case 'OPEN': return 'text-amber-600 bg-amber-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            Sécurité
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-3 ml-1">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            Protection & Conformité - Scans automatisés
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSecurityScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl gap-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scan en cours...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Scanner Sécurité
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowSensitive(!showSensitive)}
            variant="outline"
            className="border-slate-200 font-bold rounded-xl gap-2"
          >
            {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitive ? 'Masquer' : 'Détails'}
          </Button>
        </div>
      </div>

      {/* Scan Progress */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Scan de Sécurité en Cours</h3>
                  <p className="text-sm text-slate-600">Analyse des vulnérabilités et conformité...</p>
                </div>
              </div>
              <Progress value={scanProgress} className="h-3 bg-blue-100" />
              <p className="text-xs text-slate-500 mt-2">{Math.round(scanProgress)}% complété</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Overview */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">État de Sécurité Global</h3>
              <p className="text-sm text-slate-400 font-medium">Score de sécurité et métriques principales</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-black text-slate-900">{securityScan.overall.score}%</div>
                <div className="text-xs text-slate-500">Score Sécurité</div>
              </div>
              <Badge className={cn(
                "font-bold px-4 py-2",
                securityScan.overall.status === 'SECURE' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                <ShieldCheck className="w-3 h-3 mr-1" />
                {securityScan.overall.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span className="font-bold text-slate-700">Vulnérabilités</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{securityScan.vulnerabilities.length}</div>
              <div className="text-xs text-slate-500">Actives</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-slate-700">Sessions</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{securityScan.access.active_sessions}</div>
              <div className="text-xs text-slate-500">Actives</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-slate-700">Pare-feu</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{securityScan.firewall.blocked_ips}</div>
              <div className="text-xs text-slate-500">IP bloquées</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-slate-700">Conformité</span>
              </div>
              <div className="text-2xl font-black text-slate-900">4/4</div>
              <div className="text-xs text-slate-500">Normes respectées</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Vulnerabilities */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Vulnérabilités Détectées</h3>
                <p className="text-sm text-slate-400 font-medium">Liste des problèmes de sécurité identifiés</p>
              </div>
              <Badge className="bg-rose-100 text-rose-700 border-rose-200 font-bold px-3 py-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {securityScan.vulnerabilities.filter(v => v.status === 'OPEN').length} Critiques
              </Badge>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {securityScan.vulnerabilities.map((vuln, i) => (
              <motion.div
                key={vuln.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={cn("font-bold text-xs px-3 py-1", getSeverityColor(vuln.severity))}>
                        {vuln.severity}
                      </Badge>
                      <span className="font-mono text-xs text-slate-500">{vuln.cve}</span>
                      <Badge className={cn("font-bold text-xs px-3 py-1", getStatusColor(vuln.status))}>
                        {vuln.status}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 mb-2">{vuln.title}</h4>
                    <p className="text-slate-600 text-sm mb-3">{vuln.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        <span>Affecté: {vuln.affected.join(', ')}</span>
                      </div>
                      {vuln.patchedDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Corrigé: {new Date(vuln.patchedDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {vuln.status === 'OPEN' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                        Corriger
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="font-bold text-xs">
                      Détails
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Compliance & Access Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Conformité Réglementaire</h3>
                <p className="text-sm text-slate-400 font-medium">Respect des normes de sécurité</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(securityScan.compliance).map(([key, compliance]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={cn(
                      "w-5 h-5",
                      compliance.status === 'COMPLIANT' ? "text-emerald-500" : "text-amber-500"
                    )} />
                    <div>
                      <div className="font-bold text-slate-900">{key.toUpperCase().replace('_', ' ')}</div>
                      <div className="text-xs text-slate-500">{compliance.score}% conforme</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          compliance.status === 'COMPLIANT' ? "bg-emerald-500" : "bg-amber-500"
                        )}
                        style={{ width: `${compliance.score}%` }}
                      />
                    </div>
                    <Badge className={cn(
                      "font-bold text-xs px-2 py-1",
                      getStatusColor(compliance.status)
                    )}>
                      {compliance.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Access Control */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Contrôle d'Accès</h3>
                <p className="text-sm text-slate-400 font-medium">Authentification et sessions</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">ACTIF</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-black text-blue-600">{securityScan.access.active_sessions}</div>
                  <div className="text-xs text-blue-700 font-bold">Sessions Actives</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-black text-amber-600">{securityScan.access.failed_attempts}</div>
                  <div className="text-xs text-amber-700 font-bold">Tentatives Échouées</div>
                </div>
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <div className="text-2xl font-black text-rose-600">{securityScan.access.locked_accounts}</div>
                  <div className="text-xs text-rose-700 font-bold">Comptes Bloqués</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-900 mb-3">Activités Récentes</h4>
                <div className="space-y-2">
                  {securityScan.access.recent_logins.map((login, i) => (
                    <div key={i} className="flex items-center justify-between py-2 text-sm">
                      <div className="flex items-center gap-3">
                        {login.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{login.user}</div>
                          <div className="text-xs text-slate-500">{login.ip}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{login.time}</div>
                        <Badge className={cn(
                          "text-[10px] px-2 py-0.5 font-bold",
                          login.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {login.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Firewall & Network Security */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black">Sécurité Réseau & Pare-feu</h3>
              <p className="text-slate-300 font-medium">Protection en temps réel des infrastructures</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-bold px-4 py-2">
              <Shield className="w-3 h-3 mr-1" />
              ACTIF
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-blue-300" />
                <div>
                  <div className="text-2xl font-black text-white">{securityScan.firewall.rules}</div>
                  <div className="text-xs text-blue-200">Règles Actives</div>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
                Gérer Règles
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-rose-300" />
                <div>
                  <div className="text-2xl font-black text-white">{securityScan.firewall.blocked_ips}</div>
                  <div className="text-xs text-rose-200">IP Bloquées</div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 font-bold rounded-lg">
                Voir Liste
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Wifi className="w-6 h-6 text-emerald-300" />
                <div>
                  <div className="text-2xl font-black text-white">{securityScan.firewall.active_connections}</div>
                  <div className="text-xs text-emerald-200">Connexions</div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 font-bold rounded-lg">
                Monitorer
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-amber-300" />
                <div>
                  <div className="text-2xl font-black text-white">{securityScan.firewall.threats_blocked}</div>
                  <div className="text-xs text-amber-200">Menaces Bloquées</div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 font-bold rounded-lg">
                Rapport
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}