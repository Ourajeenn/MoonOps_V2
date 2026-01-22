# Architecture de la Base de Données MoonOps 🚀

Ce répertoire contient la configuration complète de la base de données PostgreSQL pour la plateforme MoonOps.

## 🏛️ Vue d'ensemble du Schéma

Le schéma est conçu pour une architecture **SaaS multi-tenant**, garantissant une isolation stricte entre les clients tout en centralisant les opérations DevOps.

### Modules Couverts :

1.  **Gestion des Projets** :
    *   `clients` : Tenants principaux.
    *   `projects` : Instances d'applications liées à un client.
    *   `environments` : Configuration des sous-environnements (Dev, Staging, Prod).
2.  **CI/CD Pipeline** :
    *   `pipelines` : Historique des builds et exécutions.
    *   `deployments` : Tracabilité des déploiements par environnement.
3.  **Monitoring & Alerting** :
    *   `metrics` : Stockage des séries temporelles (CPU, RAM, Latence).
    *   `alerts` : Gestion des incidents critiques.
4.  **Administration & Facturation** :
    *   `users` : Gestion des accès RBAC (Role-Based Access Control).
    *   `invoices` : Facturation automatisée par projet/client.
    *   `audit_logs` : Journalisation de toutes les actions administratives.

## 🛠️ Installation

### Prérequis
*   PostgreSQL 14+
*   Extension `uuid-ossp` (incluse dans le script d'init)

### Déploiement du schéma
Connectez-vous à votre instance Postgres et exécutez le script :

```bash
psql -h localhost -U postgres -d moonops -f database/init.sql
```

## 🔐 Isolation Multitenant (RLS)

Le schéma supporte la **Row Level Security (RLS)**. Pour activer l'isolation au niveau de la base de données, décommentez les politiques à la fin du fichier `init.sql`.

Chaque requête applicative devra alors définir le contexte du client :
```sql
SET app.current_client_id = 'uuid-du-client';
SELECT * FROM projects; -- Ne retournera que les projets du client défini
```

## 📊 Exemple de Reporting Global

Pour obtenir le coût total par client sur le mois en cours :
```sql
SELECT c.name, SUM(i.amount) as total_facture
FROM clients c
JOIN invoices i ON c.id = i.client_id
WHERE i.billing_period_start >= '2026-01-01'
GROUP BY c.name;
```
