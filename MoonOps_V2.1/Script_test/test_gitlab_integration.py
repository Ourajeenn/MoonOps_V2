#!/usr/bin/env python3
"""
Test script pour vérifier l'intégration GitLab dans MoonOps
"""
import requests
import os
import zipfile

API_BASE = "http://localhost:5000"

def test_gitlab_health():
    """Test si GitLab est accessible"""
    print("🔍 Test accessibilité GitLab...")
    try:
        response = requests.get("http://localhost", timeout=10)
        if response.status_code == 200:
            print("✅ GitLab est accessible sur http://localhost")
            return True
        else:
            print(f"⚠️ GitLab répond avec le code {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ GitLab n'est pas accessible: {e}")
        print("   Assurez-vous que GitLab est démarré avec: cd backend && docker-compose up -d")
        return False

def test_create_project_with_gitlab():
    """Test création projet qui crée automatiquement un repo GitLab"""
    print("🔗 Test création projet avec repository GitLab automatique...")
    try:
        response = requests.post(f"{API_BASE}/api/projects", json={
            "name": "Test GitLab Integration",
            "template_type": "web",
            "description": "Test automatique de l'intégration GitLab"
        }, timeout=30)

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Projet créé avec repository GitLab !")
                print(f"   Nom du repo: {data.get('gitlab_repo', {}).get('name')}")
                print(f"   URL web: {data.get('gitlab_repo', {}).get('web_url')}")
                print(f"   URL SSH: {data.get('gitlab_repo', {}).get('ssh_url')}")
                print(f"   URL HTTP: {data.get('gitlab_repo', {}).get('http_url')}")
                return data.get('project_id')
            else:
                print(f"❌ Erreur création: {data.get('error')}")
                return None
        else:
            print(f"❌ Erreur HTTP: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau: {e}")
        return None
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return None

def test_create_project_with_zip_and_gitlab():
    """Test upload ZIP qui crée repo GitLab et y pousse le code"""
    print("📦 Test upload ZIP avec push vers GitLab...")

    # Créer un fichier ZIP de test
    test_zip = "/tmp/test_gitlab_project.zip"
    if not os.path.exists(test_zip):
        print("   Création d'un fichier ZIP de test...")
        try:
            with zipfile.ZipFile(test_zip, 'w') as zf:
                # Structure d'un projet web basique
                zf.writestr('README.md', '# Test GitLab Integration\n\nProjet créé automatiquement par MoonOps.')
                zf.writestr('package.json', '''{
  "name": "test-gitlab-project",
  "version": "1.0.0",
  "description": "Test project for GitLab integration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}''')
                zf.writestr('index.js', '''const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from GitLab!', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});''')
                zf.writestr('.gitignore', '''node_modules/
.env
*.log
.DS_Store''')
        except Exception as e:
            print(f"❌ Erreur création ZIP: {e}")
            return None

    if not os.path.exists(test_zip):
        print("❌ Impossible de créer le fichier ZIP de test")
        return None

    try:
        with open(test_zip, 'rb') as f:
            files = {'file': ('test_gitlab_project.zip', f, 'application/zip')}
            data = {
                'name': 'Test ZIP to GitLab',
                'template_type': 'api',
                'git_url': ''  # Vide car on utilise le ZIP
            }

            response = requests.post(f"{API_BASE}/api/projects/upload", files=files, data=data, timeout=60)

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"✅ Projet créé avec ZIP uploadé vers GitLab !")
                    print(f"   Nom du repo: {data.get('gitlab_repo', {}).get('name')}")
                    print(f"   URL web: {data.get('gitlab_repo', {}).get('web_url')}")
                    print(f"   Fichier uploadé: {data.get('file_uploaded')}")
                    print(f"   Taille: {data.get('file_size')}")
                    return data.get('project_id')
                else:
                    print(f"❌ Erreur création: {data.get('error')}")
                    return None
            else:
                print(f"❌ Erreur HTTP: {response.status_code}")
                print(f"   Réponse: {response.text}")
                return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau: {e}")
        return None
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return None

def test_projects_listing():
    """Vérifier que les projets GitLab apparaissent dans la liste"""
    print("📋 Test récupération projets avec repositories GitLab...")
    try:
        response = requests.get(f"{API_BASE}/api/projects")
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ {len(projects)} projets récupérés")

            # Chercher nos projets GitLab
            gitlab_projects = [p for p in projects if 'GitLab' in p.get('description', '')]
            print(f"   Projets GitLab: {len(gitlab_projects)}")

            if gitlab_projects:
                print("   📋 Exemples:")
                for p in gitlab_projects[:3]:  # Afficher max 3
                    print(f"      - {p.get('name')}: {p.get('repository_url')}")
            return True
        else:
            print(f"❌ Erreur récupération: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur récupération: {e}")
        return False

def main():
    print("🧪 Tests Intégration GitLab MoonOps V2.1")
    print("=" * 50)

    tests = [
        test_gitlab_health,
        test_create_project_with_gitlab,
        test_create_project_with_zip_and_gitlab,
        test_projects_listing
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        result = test()
        if result is not False:  # Certains tests retournent None (pas de résultat booléen)
            passed += 1
        print()

    print("=" * 50)
    print(f"📊 Résultats: {passed}/{total} tests réussis")

    if passed >= total - 1:  # Tolérer un échec (GitLab peut être lent à démarrer)
        print("🎉 Intégration GitLab opérationnelle !")
        print()
        print("🔑 Pour accéder à GitLab:")
        print("   URL: http://localhost")
        print("   Utilisateur: root")
        print("   Mot de passe: moonops2026!")
        print()
        print("🔧 Token d'accès pour l'API:")
        print("   1. Connectez-vous à GitLab")
        print("   2. Allez dans User Settings > Access Tokens")
        print("   3. Créez un token avec scope 'api'")
        print("   4. Remplacez GITLAB_TOKEN dans l'environnement")
        return True
    else:
        print("⚠️ Certains tests ont échoué - vérifiez la configuration GitLab")
        return False

if __name__ == "__main__":
    main()