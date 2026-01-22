# Documentation Technique MoonOps 🚀

Document exhaustif de l'architecture logicielle, des technologies utilisées et du système multi-tenant de la plateforme MoonOps.

---

## 🏗️ 1. Architecture Globale
MoonOps est une plateforme **SaaS Multi-tenant** conçue pour la gestion centralisée du cycle de vie DevOps. L'architecture repose sur une isolation stricte des données (Client Isolation) et une interface utilisateur premium hautement réactive.

### 🌐 Technologies Frontend
La partie client est une application moderne construite avec :
- **React 18 & TypeScript** : Pour une logique métier robuste, typée et des composants réutilisables.
- **Vite** : Outil de build ultra-rapide pour le développement et l'optimisation de production.
- **Tailwind CSS** : Framework utilitaire pour un design sur mesure, responsive et performant.
- **Framer Motion** : Bibliothèque d'animations pour les transitions fluides et les micro-interactions premium.
- **Lucide React** : Pack d'icônes vectorielles pour une interface claire et moderne.
- **Radix UI / Shadcn UI** : Composants d'interface accessibles (modales, tabs, selects, dialogs).
- **Recharts** : Moteur de visualisation de données pour les tableaux de bord analytiques et financiers.
- **Sonner** : Système de notifications (toasts) pour un feedback utilisateur en temps réel.

### 🗄️ Architecture Backend (PostgreSQL)
Le backend repose sur une instance **PostgreSQL** hautement sécurisée utilisant le pattern de **Row-Level Security (RLS)** pour l'isolation multi-tenant.

#### Points clés du Backend :
1. **Isolation Multi-tenant** : Au lieu d'avoir une base de données par client, nous utilisons une base partagée où chaque ligne appartient à un `client_id`.
2. **PostgreSQL RLS** : Des politiques de sécurité sont définies au niveau du moteur de la base. Même une erreur de code applicatif ne peut pas permettre à un client de voir les données d'un autre.
3. **Audit Log** : Chaque action sensible est enregistrée dans une table d'audit immuable.
4. **Intégration Vault** : Gestion des secrets (clés API, credentials) via HashiCorp Vault pour éviter le stockage en clair.

---

## 📄 2. Spécifications Techniques détaillées

### 🎨 Frontend - Structure des Modules
L'application est découpée en modules fonctionnels indépendants :
- **DashboardOverview** : Vue synthétique des performances système et des alertes critiques.
- **ProjectsModule** : Gestion des instances (création, déploiement via templates).
- **CICDModule** : Visualisation des pipelines, déploiements en temps réel et logs.
- **MonitoringModule** : Intégration Grafana et métriques d'infrastructure.
- **SecurityModule** : Scans de vulnérabilités OWASP et rapports de conformité.
- **AdminModule** : Gestion du personnel (RBAC) et facturation (Invoices).
- **HelpDeskModule** : Centre d'assistance complet avec documentation et coaching agile.

### 🔐 Backend - Modèle Conceptuel (MCD)
Le schéma est hiérarchisé pour garantir l'intégrité :
- **Client (Tenant)** : L'entité racine. Tout appartient à un client.
- **Utilisateur (User)** : Lié à un client avec un rôle spécifique (Admin, Developer, etc.).
- **Projet** : Unité de travail contenant des environnements et des pipelines.
- **Pipeline & Déploiement** : Historique des changements de code et états de production.
- **Facturation** : Calculée dynamiquement selon la consommation de ressources.

---

## 🛠️ 3. Fonctionnement des Composants Critiques

### 🛡️ Sécurité & Authentification
- **Authentification** : Gestion des sessions via JWT avec une page de connexion hautement sécurisée.
- **Protection OWASP** : Validation stricte des entrées via **Zod** (TypeScript) pour prévenir les injections.
- **RBAC (Role-Based Access Control)** : Les menus et actions (ex: "Lancer Pipeline") sont activés ou désactivés selon le rôle de l'utilisateur.

### 📊 Système de Facturation (Billing)
- **Génération PDF** : Le système génère des factures détaillées basées sur les métriques de consommation stockées en base.
- **Aperçu Impression** : Fonctionnalité "Self-service" permettant aux clients d'imprimer leurs rapports fiscaux directement depuis l'interface.

### 🆘 Help Desk & Coaching
- **Documentation auto-générée** : MoonOps utilise les schémas d'API pour maintenir une documentation technique à jour.
- **Encadrement Expert** : Mise en relation directe avec des encadrants techniques et coachs agiles via des canaux dédiés (Slack/Tickets).

---

## 🚀 4. Déploiement & Maintenance
- **Frontend** : Déployé sur des réseaux de distribution globaux (Vercel/Netlify) pour une latence minimale.
- **Database** : PostgreSQL managé avec backups automatiques et haute disponibilité.
- **Pipeline CICD** : MoonOps utilise MoonOps pour son propre déploiement ("Dogfooding").

---

*Date de dernière mise à jour : 19 Janvier 2026*
*Version : 1.2.4 "DevOps Central"*
