# 🚀 Instructions MVP - MoonOps Jour 2

## 📋 Prérequis

- Python 3.8+ installé
- Node.js 18+ installé
- PostgreSQL accessible sur 192.168.9.6:5432
- Base de données `moonops_appdb` créée

## 🔧 Installation

### 1. Initialiser la base de données

Si ce n'est pas déjà fait, exécutez le script SQL :

```bash
psql -h 192.168.9.6 -U moonops_app -d moonops_appdb -f database/init.sql
```

Ou testez la connexion :

```bash
python3 database/test_connection.py
```

### 2. Installer le backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Installer le frontend

```bash
cd ..
npm install
```

## 🚀 Démarrage

### Terminal 1 : Backend Flask

```bash
cd backend
python app.py
```

Le backend sera accessible sur : **http://localhost:5000**

### Terminal 2 : Frontend React

```bash
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173**

## ✅ Test du flow MVP

### 1. Login
- Accédez à http://localhost:5173
- Utilisez les identifiants :
  - **Email** : `admin@techconsulting.fr`
  - **Password** : `demo2026`
- Cliquez sur "INITIALISE SESSION"
- ✅ Vous devez être connecté et redirigé vers le dashboard

### 2. Dashboard
- Vérifiez que les statistiques s'affichent
- Les KPI doivent charger depuis l'API backend
- ✅ Les graphiques doivent s'afficher

### 3. Créer un projet
- Cliquez sur l'onglet "Projets" dans la sidebar
- Cliquez sur "NOUVEAU PROJET"
- Sélectionnez un template (Web, Mobile, ou API)
- Entrez un nom de projet (ex: "Mon Super Projet")
- Cliquez sur "CRÉER LE PROJET"
- ✅ Un toast de succès doit apparaître
- ✅ Le projet doit apparaître dans la liste

### 4. Déployer
- Cliquez sur l'onglet "CI/CD" dans la sidebar
- Cliquez sur "LANCER PIPELINE"
- ✅ Un toast de succès doit confirmer le déploiement

## 🧪 Tests API directs

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techconsulting.fr","password":"demo2026"}'
```

### Liste des projets
```bash
curl http://localhost:5000/api/projects
```

### Créer un projet
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test API Project","template_type":"web"}'
```

### Stats Dashboard
```bash
curl http://localhost:5000/api/stats
```

### Déploiement
```bash
curl -X POST http://localhost:5000/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"project_id":"1","environment":"DEV"}'
```

## 📁 Structure du projet

```
MoonOps_V2/
├── backend/                    # API Flask
│   ├── app.py                 # Routes API principales
│   ├── config.py              # Configuration PostgreSQL
│   ├── requirements.txt       # Dépendances Python
│   ├── start.sh              # Script de démarrage
│   └── README.md             # Documentation backend
├── database/                   # Base de données
│   ├── init.sql              # Schema + données de démo
│   ├── test_connection.py    # Test connexion PostgreSQL
│   └── DOCUMENTATION_TECHNIQUE.md
├── src/                       # Frontend React
│   └── app/
│       └── components/
│           ├── LoginPage.tsx     # ✅ Connecté à l'API
│           ├── DashboardOverview.tsx  # ✅ Connecté à l'API
│           ├── ProjectsModule.tsx     # ✅ Connecté à l'API
│           └── CICDModule.tsx         # ✅ Connecté à l'API
└── MVP_INSTRUCTIONS.md        # Ce fichier

```

## 🎯 Critères MVP validés

| Critère | Status |
|---------|--------|
| ✅ Se connecter avec login/password | OK |
| ✅ Accéder au dashboard | OK |
| ✅ Créer un projet | OK |
| ✅ Cliquer sur "Déployer" | OK |
| ✅ Voir un message de succès | OK |
| ✅ Frontend connecté au backend | OK |
| ✅ Backend qui répond | OK |
| ✅ Base de données utilisée | OK |
| ✅ Pas juste des maquettes | OK |

## 🐛 Troubleshooting

### Erreur de connexion backend
- Vérifiez que Flask est démarré : `http://localhost:5000/api/health`
- Vérifiez les logs du terminal backend

### Erreur PostgreSQL
- Testez la connexion : `python3 database/test_connection.py`
- Vérifiez que PostgreSQL est accessible depuis votre machine
- Vérifiez les credentials dans `backend/config.py`

### CORS Error
- Vérifiez que le backend autorise l'origin du frontend
- Voir `CORS_ORIGINS` dans `backend/app.py`

### Frontend ne charge pas les données
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs réseau dans l'onglet Network
- Vérifiez que l'URL de l'API est correcte (`http://localhost:5000`)

## 🎉 Prochaines étapes (Jour 3+)

- Ajouter l'authentification JWT
- Implémenter le vrai système de pipelines
- Ajouter le monitoring en temps réel
- Créer le module de sécurité avec scan de vulnérabilités
- Implémenter le système d'alertes
- Ajouter le reporting et la facturation
