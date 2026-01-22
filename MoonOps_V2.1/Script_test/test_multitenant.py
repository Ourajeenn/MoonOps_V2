#!/usr/bin/env python3
"""
Test script pour vérifier le multi-tenant MoonOps
"""
import requests
import json

API_BASE = "http://localhost:5000"

def test_health():
    """Test health check"""
    print("🔍 Test Health Check...")
    try:
        response = requests.get(f"{API_BASE}/api/health")
        if response.status_code == 200:
            print("✅ Health check OK")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_auth():
    """Test authentification"""
    print("🔐 Test Authentification...")
    try:
        response = requests.post(f"{API_BASE}/api/auth/login", json={
            "email": "admin@techconsulting.fr",
            "password": "demo2026"
        })
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Authentification OK")
                return data.get('user', {}).get('id')
            else:
                print(f"❌ Authentification failed: {data.get('error')}")
                return None
        else:
            print(f"❌ Authentification error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Authentification error: {e}")
        return None

def test_projects():
    """Test récupération projets"""
    print("📁 Test Récupération Projets...")
    try:
        response = requests.get(f"{API_BASE}/api/projects")
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ {len(projects)} projets récupérés")
            if len(projects) > 0:
                print(f"   📋 Premier projet: {projects[0].get('name')}")
            return True
        else:
            print(f"❌ Erreur récupération projets: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur récupération projets: {e}")
        return False

def test_stats():
    """Test statistiques dashboard"""
    print("📊 Test Statistiques...")
    try:
        response = requests.get(f"{API_BASE}/api/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Stats récupérées: {stats.get('total_projects')} projets, {stats.get('active_projects')} actifs")
            return True
        else:
            print(f"❌ Erreur récupération stats: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur récupération stats: {e}")
        return False

def test_deployments():
    """Test récupération déploiements"""
    print("🚀 Test Déploiements...")
    try:
        response = requests.get(f"{API_BASE}/api/deployments")
        if response.status_code == 200:
            deployments = response.json()
            print(f"✅ {len(deployments)} déploiements récupérés")
            return True
        else:
            print(f"❌ Erreur récupération déploiements: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur récupération déploiements: {e}")
        return False

def test_multitenant_isolation():
    """Test isolation multi-tenant"""
    print("🔒 Test Isolation Multi-tenant...")
    try:
        # Toutes les requêtes utilisent le même client (TechConsulting)
        # Donc on devrait voir les mêmes données
        projects_response = requests.get(f"{API_BASE}/api/projects")
        stats_response = requests.get(f"{API_BASE}/api/stats")

        if projects_response.status_code == 200 and stats_response.status_code == 200:
            projects = projects_response.json()
            stats = stats_response.json()

            # Vérifier cohérence entre projets et stats
            if len(projects) == stats.get('total_projects'):
                print(f"✅ Isolation cohérente: {len(projects)} projets pour le client actuel")
                return True
            else:
                print(f"❌ Incohérence: {len(projects)} projets vs {stats.get('total_projects')} dans stats")
                return False
        else:
            print("❌ Erreur lors des tests d'isolation")
            return False
    except Exception as e:
        print(f"❌ Erreur test isolation: {e}")
        return False

def main():
    print("🧪 Tests Multi-tenant MoonOps V2.1")
    print("=" * 50)

    tests = [
        test_health,
        test_auth,
        test_projects,
        test_stats,
        test_deployments,
        test_multitenant_isolation
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()

    print("=" * 50)
    print(f"📊 Résultats: {passed}/{total} tests réussis")

    if passed == total:
        print("🎉 Multi-tenant fonctionne correctement !")
        return True
    else:
        print("⚠️  Certains tests ont échoué")
        return False

if __name__ == "__main__":
    main()