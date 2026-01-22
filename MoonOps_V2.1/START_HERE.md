# 🚀 Démarrage rapide - MVP MoonOps Jour 2

## ⚡ Quick Start (3 étapes)

### 1️⃣ Installer les dépendances backend

```bash
cd backend
pip install -r requirements.txt
```

### 2️⃣ Démarrer le backend Flask

```bash
python app.py
```

Le backend sera sur : **http://localhost:5000**

### 3️⃣ Démarrer le frontend React (dans un nouveau terminal)

```bash
cd /home/red/Documents/Ecole-IT/GitMoonops/MoonOps_V2
npm run dev
```

Le frontend sera sur : **http://localhost:5173**

---

## 🎯 Test du MVP

1. **Ouvrez** http://localhost:5173
2. **Connectez-vous** avec :
   - Email : `admin@techconsulting.fr`
   - Mot de passe : `demo2026`
3. **Naviguez** dans le dashboard (stats chargées depuis l'API)
4. **Créez un projet** via l'onglet "Projets"
5. **Déployez** via l'onglet "CI/CD" → "LANCER PIPELINE"

---

## 📋 Checklist MVP Validé

- ✅ Backend Flask créé avec 6 routes API
- ✅ Connexion PostgreSQL configurée (192.168.9.6:5432)
- ✅ LoginPage connecté à `/api/auth/login`
- ✅ DashboardOverview connecté à `/api/stats`
- ✅ ProjectsModule connecté à `/api/projects` (GET/POST)
- ✅ CICDModule connecté à `/api/deploy`
- ✅ Frontend affiche données en temps réel
- ✅ Création de projet persiste en BDD
- ✅ Déploiement simulé fonctionnel

---

## 📖 Documentation complète

Consultez [`MVP_INSTRUCTIONS.md`](MVP_INSTRUCTIONS.md) pour :
- Instructions détaillées
- Tests API avec curl
- Troubleshooting
- Architecture du projet

---

## 🔧 Commandes utiles

### Tester la connexion PostgreSQL
```bash
python3 database/test_connection.py
```

### Tester l'API backend
```bash
curl http://localhost:5000/api/health
```

### Vérifier les logs backend
Les logs s'affichent dans le terminal où `python app.py` est lancé.

---

## 📦 Structure créée

```
backend/
├── app.py              ✅ API Flask complète
├── config.py           ✅ Configuration PostgreSQL
├── requirements.txt    ✅ Dépendances Python
├── start.sh           ✅ Script de démarrage
└── README.md          ✅ Documentation

src/app/components/
├── LoginPage.tsx      ✅ Connecté à l'API
├── DashboardOverview.tsx  ✅ Connecté à l'API
├── ProjectsModule.tsx     ✅ Connecté à l'API
└── CICDModule.tsx         ✅ Connecté à l'API
```

---

## 🎉 MVP Jour 2 TERMINÉ !

Toutes les fonctionnalités demandées sont implémentées :
- ✅ Login fonctionnel avec backend
- ✅ Dashboard avec données réelles
- ✅ Création de projet persistée en BDD
- ✅ Déploiement simulé opérationnel
- ✅ Frontend ↔ Backend ↔ PostgreSQL connectés

**Bonne démo ! 🚀**
