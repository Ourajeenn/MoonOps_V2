#!/usr/bin/env python3
"""
Diagnostic complet de l'accès GitLab
"""
import requests
import os
import sys

GITLAB_URL = "http://localhost"
GITLAB_TOKEN = "glpat-hsTYPgfk2k8jys4SeH9zc286MQp1OjEH.01.0w1vyccg7"

def test_gitlab_connectivity():
    """Test de base de la connectivité GitLab"""
    print("🌐 Test de connectivité GitLab...")

    try:
        # Test sans authentification
        response = requests.get(GITLAB_URL, timeout=10)
        if response.status_code == 200:
            print("✅ GitLab répond sur HTTP")
            return True
        else:
            print(f"⚠️ GitLab répond avec HTTP {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ GitLab n'est pas accessible: {e}")
        print("   Solutions:")
        print("   1. Vérifier que GitLab est démarré: docker-compose ps")
        print("   2. Attendre l'initialisation (5-10 min au premier lancement)")
        print("   3. Vérifier les logs: docker-compose logs gitlab")
        return False

def test_gitlab_api():
    """Test de l'API GitLab avec authentification"""
    print("\n🔑 Test API GitLab avec authentification...")

    headers = {
        'PRIVATE-TOKEN': GITLAB_TOKEN,
        'Content-Type': 'application/json'
    }

    try:
        # Test de récupération des infos utilisateur
        user_url = f"{GITLAB_URL}/api/v4/user"
        print(f"   Appel: GET {user_url}")

        response = requests.get(user_url, headers=headers, timeout=10)

        if response.status_code == 200:
            user = response.json()
            print(f"✅ Token valide - Utilisateur: {user.get('name', 'Unknown')} ({user.get('username', 'unknown')})")
            return True
        elif response.status_code == 401:
            print("❌ Token invalide ou expiré")
            print("   Vérifier le token dans GitLab > User Settings > Access Tokens")
            return False
        elif response.status_code == 403:
            print("❌ Permissions insuffisantes")
            print("   Le token doit avoir les scopes: api, write_repository")
            return False
        else:
            print(f"❌ Erreur API: HTTP {response.status_code}")
            print(f"   Réponse: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau API: {e}")
        return False

def test_create_repository():
    """Test de création d'un repository"""
    print("\n📁 Test création repository...")

    headers = {
        'PRIVATE-TOKEN': GITLAB_TOKEN,
        'Content-Type': 'application/json'
    }

    data = {
        'name': 'diagnostic-test-repo',
        'description': 'Repository de test pour diagnostic MoonOps',
        'visibility': 'private',
        'initialize_with_readme': True
    }

    try:
        url = f"{GITLAB_URL}/api/v4/projects"
        print(f"   Appel: POST {url}")
        print(f"   Données: {data}")

        response = requests.post(url, headers=headers, json=data, timeout=30)

        if response.status_code == 201:
            repo = response.json()
            print(f"✅ Repository créé avec succès!")
            print(f"   Nom: {repo.get('name_with_namespace')}")
            print(f"   URL: {repo.get('web_url')}")
            return repo.get('id')
        elif response.status_code == 400:
            error = response.json()
            print(f"❌ Erreur de validation: {error.get('message', 'Données invalides')}")
            if 'has already been taken' in str(error):
                print("   💡 Le repository existe déjà")
            return None
        elif response.status_code == 401:
            print("❌ Authentification échouée")
            return None
        elif response.status_code == 403:
            print("❌ Permissions insuffisantes pour créer des repositories")
            return None
        else:
            print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau: {e}")
        return None

def cleanup_test_repo(repo_id):
    """Nettoyer le repository de test"""
    if not repo_id:
        return

    print(f"\n🧹 Nettoyage repository de test (ID: {repo_id})...")

    headers = {
        'PRIVATE-TOKEN': GITLAB_TOKEN,
    }

    try:
        url = f"{GITLAB_URL}/api/v4/projects/{repo_id}"
        response = requests.delete(url, headers=headers, timeout=10)

        if response.status_code == 202:
            print("✅ Repository de test supprimé")
        else:
            print(f"⚠️ Impossible de supprimer le repository: HTTP {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Erreur lors du nettoyage: {e}")

def main():
    print("🔍 Diagnostic complet GitLab pour MoonOps")
    print("=" * 50)

    # Étape 1: Connectivité de base
    gitlab_up = test_gitlab_connectivity()
    if not gitlab_up:
        print("\n❌ Diagnostic arrêté - GitLab n'est pas accessible")
        return False

    # Étape 2: API avec authentification
    api_ok = test_gitlab_api()
    if not api_ok:
        print("\n❌ Diagnostic arrêté - Problème d'authentification")
        return False

    # Étape 3: Création de repository
    repo_id = test_create_repository()

    # Étape 4: Nettoyage
    if repo_id:
        cleanup_test_repo(repo_id)

    print("\n" + "=" * 50)
    if repo_id:
        print("🎉 GitLab est entièrement opérationnel pour MoonOps!")
        print("\n🚀 Vous pouvez maintenant:")
        print("   - Créer des projets dans MoonOps")
        print("   - Uploader des fichiers ZIP")
        print("   - Voir le code poussé automatiquement sur GitLab")
        return True
    else:
        print("❌ GitLab a des problèmes pour créer des repositories")
        print("\n🔧 Solutions possibles:")
        print("   1. Vérifier les permissions du token")
        print("   2. S'assurer que l'utilisateur peut créer des projets")
        print("   3. Vérifier les quotas de projets sur GitLab")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)