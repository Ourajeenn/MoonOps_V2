# MoonOps Backend API

API Flask pour la plateforme DevOps Central multi-tenant.

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Configuration

Les paramètres de connexion PostgreSQL sont dans `config.py` :
- Host: 192.168.9.6:5432
- Database: moonops_appdb
- User: moonops_app

## Lancement

```bash
python app.py
```

L'API sera accessible sur `http://localhost:5000`

## Routes disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/login` | POST | Authentification utilisateur |
| `/api/projects` | GET | Liste des projets |
| `/api/projects` | POST | Création de projet |
| `/api/deploy` | POST | Lancement déploiement |
| `/api/stats` | GET | Statistiques dashboard |
| `/api/pipelines` | GET | Liste des pipelines |
| `/api/health` | GET | Health check |

## Test

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techconsulting.fr","password":"demo2026"}'
```
