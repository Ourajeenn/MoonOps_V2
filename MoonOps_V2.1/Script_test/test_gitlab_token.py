#!/usr/bin/env python3
"""
Test rapide du token GitLab
"""
import requests
import os

GITLAB_URL = "http://localhost"
GITLAB_TOKEN = "glpat-hsTYPgfk2k8jys4SeH9zc286MQp1OjEH.01.0w1vyccg7"

def test_token():
    """Test si le token GitLab fonctionne"""
    headers = {
        'PRIVATE-TOKEN': GITLAB_TOKEN,
        'Content-Type': 'application/json'
    }

    try:
        # Test 1: Récupérer les infos utilisateur
        print("🔍 Test du token GitLab...")
        response = requests.get(f"{GITLAB_URL}/api/v4/user", headers=headers, timeout=10)

        if response.status_code == 200:
            user = response.json()
            print(f"✅ Token valide - Utilisateur: {user['name']} ({user['username']})")
            return True
        else:
            print(f"❌ Erreur token: {response.status_code} - {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        print("   Vérifiez que GitLab est démarré: cd backend && docker-compose ps")
        return False

def test_create_repo():
    """Test création d'un repository (optionnel)"""
    headers = {
        'PRIVATE-TOKEN': GITLAB_TOKEN,
        'Content-Type': 'application/json'
    }

    data = {
        'name': 'test-moonops-integration',
        'description': 'Repository de test pour MoonOps',
        'visibility': 'private',
        'initialize_with_readme': True
    }

    try:
        print("🔨 Test création repository...")
        response = requests.post(f"{GITLAB_URL}/api/v4/projects", headers=headers, json=data, timeout=30)

        if response.status_code == 201:
            repo = response.json()
            print(f"✅ Repository créé: {repo['web_url']}")
            return True
        elif response.status_code == 400 and 'has already been taken' in response.text:
            print("ℹ️ Repository de test existe déjà")
            return True
        else:
            print(f"❌ Erreur création repo: {response.status_code} - {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la création: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Test du token GitLab pour MoonOps")
    print("=" * 50)

    success = True

    # Test du token
    if not test_token():
        success = False

    # Test création repo (si token OK)
    if success:
        if not test_create_repo():
            success = False

    print("=" * 50)
    if success:
        print("🎉 Token GitLab opérationnel ! Prêt pour MoonOps.")
        print()
        print("🚀 Vous pouvez maintenant lancer:")
        print("   ./DEMARRAGE_RAPIDE.sh")
    else:
        print("❌ Problème avec le token GitLab.")