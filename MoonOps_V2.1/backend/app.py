from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os
import uuid
import requests
import subprocess
import tempfile
from dotenv import load_dotenv
import bcrypt

# Charger les variables d'environnement depuis gitlab.env s'il existe
env_file = os.path.join(os.path.dirname(__file__), 'gitlab.env')
if os.path.exists(env_file):
    load_dotenv(env_file)
    print(f"✅ Configuration chargée depuis {env_file}")
else:
    print("⚠️ Fichier gitlab.env non trouvé, utilisation des variables d'environnement système")

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"])

# Configuration PostgreSQL
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "database": "moonops_appdb",
    "user": "moonops_app",
    "password": "moonops_app_2026!"
}

# Configuration upload de fichiers
UPLOAD_FOLDER = '/tmp/moonops_uploads'
ALLOWED_EXTENSIONS = {'zip'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

# Configuration Flask pour upload
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Créer le dossier d'upload s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configuration GitLab
GITLAB_URL = os.getenv('GITLAB_URL', 'http://gitlab')
GITLAB_TOKEN = os.getenv('GITLAB_TOKEN', 'glpat-1234567890abcdef')  # Token à configurer
GITLAB_API_VERSION = 'v4'

# Configuration projets locaux (pour développement)
PROJECTS_FOLDER = '/tmp/moonops_projects'
os.makedirs(PROJECTS_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Vérifie si le fichier est un ZIP"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db():
    """Connexion à PostgreSQL"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def db_query(query, params=None, fetch_one=False):
    """Helper pour exécuter des requêtes"""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if query.strip().upper().startswith("SELECT"):
                result = cur.fetchone() if fetch_one else cur.fetchall()
                return result
            conn.commit()
            return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# ============================================
# ROUTES AUTH
# ============================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authentification utilisateur"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"success": False, "error": "Email et mot de passe requis"}), 400
    
    # Vérification en base avec hash bcrypt
    try:
        user = db_query(
            "SELECT id, email, full_name, role, client_id, password_hash FROM users WHERE email = %s AND is_active = TRUE",
            (email,),
            fetch_one=True
        )

        if user and user['password_hash']:
            # Vérification du mot de passe avec bcrypt
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({
                    "success": True,
                    "user": {
                        "id": str(user['id']),
                        "email": user['email'],
                        "name": user['full_name'],
                        "role": user['role'],
                        "client_id": str(user['client_id'])
                    }
                })

        return jsonify({"success": False, "error": "Identifiants invalides"}), 401

    except Exception as e:
        print(f"Erreur login: {str(e)}")
        return jsonify({"success": False, "error": "Erreur serveur"}), 500

# ============================================
# ROUTES PROJECTS
# ============================================

def get_current_client_id():
    """Obtenir l'ID du client actuel depuis la session (simulation)"""
    # Pour la démo multi-tenant, on simule différents clients
    # En production, cela viendrait du JWT token ou de la session

    # Pour la démo, on peut utiliser un paramètre d'URL ou un header
    # ou baser sur l'utilisateur connecté (simulation)
    import random

    # Simulation: différents clients pour la démo
    # En vrai, cela viendrait de l'authentification
    demo_clients = [
        'fcb79070-fca6-4367-8f74-fa138223fa97',  # TechConsulting (défaut)
        'ae89d37b-8b81-46d4-acf4-9bf17e3342db',  # ClientA
        'ff8f1b6d-8afc-4abf-97e4-22b73f69343a',  # ClientB
    ]

    # Pour la démo, on alterne entre les clients
    # En production: lire depuis le JWT token
    client_index = hash(request.remote_addr or 'demo') % len(demo_clients)
    current_client = demo_clients[client_index]

    # Récupérer le nom du client pour les logs
    try:
        client_info = db_query("SELECT name FROM clients WHERE id = %s", (current_client,), fetch_one=True)
        if client_info:
            print(f"🔐 Client actuel: {client_info['name']} ({current_client[:8]}...)")
        else:
            print(f"🔐 Client actuel: {current_client[:8]}... (non trouvé en DB)")
    except:
        print(f"🔐 Client actuel: {current_client[:8]}...")

    return current_client

def get_or_create_gitlab_group(client_id):
    """Obtient ou crée un groupe GitLab pour le client"""
    try:
        headers = {
            'PRIVATE-TOKEN': GITLAB_TOKEN,
            'Content-Type': 'application/json'
        }

        # Récupérer le nom du client depuis la base
        client_info = db_query("SELECT name FROM clients WHERE id = %s", (client_id,), fetch_one=True)
        if not client_info:
            print(f"❌ Client {client_id} non trouvé")
            return None

        client_name = client_info['name']
        group_name = f"client-{client_name.lower().replace(' ', '-')}"
        group_path = group_name

        # Vérifier si le groupe existe déjà
        search_url = f"{GITLAB_URL}/api/{GITLAB_API_VERSION}/groups?search={group_name}"
        response = requests.get(search_url, headers=headers, timeout=10)

        if response.status_code == 200:
            groups = response.json()
            existing_group = next((g for g in groups if g['path'] == group_path), None)

            if existing_group:
                print(f"✅ Groupe GitLab trouvé: {existing_group['full_name']}")
                return existing_group['id']

        # Créer le groupe si il n'existe pas
        data = {
            'name': f"Client {client_name}",
            'path': group_path,
            'description': f"Groupe pour le client {client_name}",
            'visibility': 'private'
        }

        create_url = f"{GITLAB_URL}/api/{GITLAB_API_VERSION}/groups"
        response = requests.post(create_url, headers=headers, json=data, timeout=30)

        if response.status_code == 201:
            group_data = response.json()
            print(f"✅ Groupe GitLab créé: {group_data['full_name']}")
            return group_data['id']
        else:
            print(f"❌ Erreur création groupe GitLab: HTTP {response.status_code}")
            print(f"   Détails: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Erreur groupe GitLab: {e}")
        return None

def create_gitlab_repository(project_name, description="", client_id=None):
    """Crée un repository GitLab via API avec isolation par client"""
    try:
        headers = {
            'PRIVATE-TOKEN': GITLAB_TOKEN,
            'Content-Type': 'application/json'
        }

        # Obtenir ou créer le groupe du client
        group_id = None
        if client_id:
            group_id = get_or_create_gitlab_group(client_id)

        # Générer un nom unique pour éviter les conflits
        import time
        timestamp = str(int(time.time()))
        unique_name = f"{project_name}-{timestamp}"

        data = {
            'name': unique_name,  # Nom unique avec timestamp
            'description': description,
            'visibility': 'private',  # private pour la sécurité
            'initialize_with_readme': True  # Créer avec un README
        }

        # Si on a un groupe, créer le repo dans ce groupe
        if group_id:
            data['namespace_id'] = group_id

        url = f"{GITLAB_URL}/api/{GITLAB_API_VERSION}/projects"
        response = requests.post(url, headers=headers, json=data, timeout=30)

        if response.status_code == 201:
            repo_data = response.json()
            print(f"✅ Repository GitLab créé: {repo_data['name_with_namespace']} (nom unique: {unique_name})")
            return {
                'repo_id': repo_data['id'],
                'name': repo_data['name'],
                'ssh_url': repo_data['ssh_url_to_repo'],
                'http_url': repo_data['http_url_to_repo'],
                'web_url': repo_data['web_url']
            }
        else:
            print(f"❌ Erreur création repo GitLab: HTTP {response.status_code}")
            print(f"   URL: {url}")
            print(f"   Token: {GITLAB_TOKEN[:10]}...")  # Premier 10 caractères seulement
            try:
                error_details = response.json()
                print(f"   Détails: {error_details}")
            except:
                print(f"   Réponse: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur connexion GitLab: {e}")
        return None
    except Exception as e:
        print(f"❌ Erreur création repository GitLab: {e}")
        return None

def initialize_git_repo(local_path, gitlab_repo_url):
    """Initialise un repo Git local et pousse vers GitLab"""
    try:
        # Vérifier si c'est déjà un repo Git
        if os.path.exists(os.path.join(local_path, '.git')):
            print("ℹ️ Repository Git déjà initialisé")
            return True

        # Initialiser le repo Git
        result = subprocess.run(
            ['git', 'init'],
            cwd=local_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            print(f"❌ Erreur git init: {result.stderr}")
            return False

        # Configurer Git
        subprocess.run(['git', 'config', 'user.name', 'MoonOps'], cwd=local_path)
        subprocess.run(['git', 'config', 'user.email', 'moonops@techconsulting.fr'], cwd=local_path)

        # Vérifier s'il y a des fichiers à committer
        result_status = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=local_path,
            capture_output=True,
            text=True,
            timeout=30
        )

        # Si rien à committer, créer un README.md
        if not result_status.stdout.strip():
            print("ℹ️ Aucun fichier trouvé, création d'un README.md par défaut")
            readme_path = os.path.join(local_path, 'README.md')
            with open(readme_path, 'w') as f:
                f.write(f'''# {os.path.basename(local_path)}

Ce projet a été créé automatiquement via MoonOps.

## À propos

- **Créé le**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Source**: Archive ZIP uploadée
- **Repository GitLab**: {gitlab_repo_url}

## Démarrage rapide

Consultez la documentation pour les instructions d'installation et de déploiement.
''')

        # Ajouter tous les fichiers (y compris le README créé)
        subprocess.run(['git', 'add', '.'], cwd=local_path)

        # Commit initial
        result = subprocess.run(
            ['git', 'commit', '-m', 'Initial commit from MoonOps'],
            cwd=local_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            print(f"❌ Erreur git commit: {result.stderr}")
            print(f"   Sortie: {result.stdout}")
            return False

        # Configurer Git avec les credentials
        subprocess.run(['git', 'config', 'user.name', 'MoonOps'], cwd=local_path)
        subprocess.run(['git', 'config', 'user.email', 'moonops@techconsulting.fr'], cwd=local_path)

        # Ajouter le remote avec token dans l'URL pour éviter la demande d'identifiants
        auth_url = gitlab_repo_url.replace('http://', f'http://oauth2:{GITLAB_TOKEN}@')
        subprocess.run(['git', 'remote', 'add', 'origin', auth_url], cwd=local_path)

        # Forcer l'utilisation de la branche 'main' (standard moderne)
        subprocess.run(['git', 'branch', '-M', 'main'], cwd=local_path)
        branch_name = 'main'

        # Si GitLab a créé un README initial, récupérer les changements distants d'abord
        pull_result = subprocess.run(
            ['git', 'pull', 'origin', 'main', '--allow-unrelated-histories'],
            cwd=local_path,
            capture_output=True,
            text=True,
            timeout=60
        )

        # Si le pull échoue (pas de remote main), c'est normal pour un nouveau repo
        if pull_result.returncode != 0 and 'could not read from remote repository' not in pull_result.stderr:
            print(f"ℹ️ Pull initial: {pull_result.stderr}")

        # Pousser vers GitLab sur la branche main
        result = subprocess.run(
            ['git', 'push', '-u', 'origin', 'main'],
            cwd=local_path,
            capture_output=True,
            text=True,
            timeout=120
        )

        if result.returncode != 0:
            print(f"❌ Erreur git push: {result.stderr}")
            return False

        print(f"✅ Code poussé vers GitLab: {gitlab_repo_url} (branche: main)")
        return True

    except subprocess.TimeoutExpired:
        print("❌ Timeout lors des opérations Git")
        return False
    except Exception as e:
        print(f"❌ Erreur initialisation Git: {e}")
        return False

def extract_zip_to_temp(zip_path, project_name):
    """Extrait un ZIP dans un dossier temporaire"""
    try:
        # Créer un dossier temporaire unique
        temp_dir = os.path.join(PROJECTS_FOLDER, f"{project_name}_{uuid.uuid4().hex[:8]}")
        os.makedirs(temp_dir, exist_ok=True)

        # Extraire le ZIP
        import zipfile
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Vérifier le contenu extrait
        extracted_items = os.listdir(temp_dir)

        # Si il n'y a qu'un seul dossier, utiliser son contenu
        if len(extracted_items) == 1 and os.path.isdir(os.path.join(temp_dir, extracted_items[0])):
            subdir = os.path.join(temp_dir, extracted_items[0])
            subdir_contents = os.listdir(subdir)

            # Déplacer le contenu du sous-dossier vers temp_dir
            for item in subdir_contents:
                src = os.path.join(subdir, item)
                dst = os.path.join(temp_dir, item)
                os.rename(src, dst)

            # Supprimer le sous-dossier vide
            os.rmdir(subdir)
            print(f"✅ Contenu déplacé depuis le dossier racine: {extracted_items[0]}")

        final_items = os.listdir(temp_dir)
        print(f"✅ ZIP extrait vers: {temp_dir} ({len(final_items)} éléments)")
        return temp_dir

    except Exception as e:
        print(f"❌ Erreur extraction ZIP: {e}")
        return None

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Liste des projets pour le client actuel"""
    try:
        client_id = get_current_client_id()
        projects = db_query("""
            SELECT p.id, p.name, p.description, p.template_type, p.status,
                   p.repository_url, p.created_at, p.last_deployed_at,
                   c.name as client_name
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            WHERE p.client_id = %s
            ORDER BY p.created_at DESC
        """, (client_id,))
        
        if projects:
            result = []
            for p in projects:
                project_dict = dict(p)
                # Convertir les UUID et datetime en strings
                project_dict['id'] = str(project_dict['id'])
                if project_dict.get('created_at'):
                    project_dict['created_at'] = project_dict['created_at'].isoformat()
                if project_dict.get('last_deployed_at'):
                    project_dict['last_deployed_at'] = project_dict['last_deployed_at'].isoformat()
                result.append(project_dict)
            return jsonify(result)
        return jsonify([])
        
    except Exception as e:
        print(f"Erreur get_projects: {str(e)}")
        # Retourner une liste vide si erreur DB
        return jsonify([])

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Créer un nouveau projet pour le client actuel avec repository GitLab"""
    data = request.json
    name = data.get('name')
    template_type = data.get('template_type', 'web')
    description = data.get('description', '')
    repository_url = data.get('repository_url', '')  # URL Git existante (optionnel)
    client_id = get_current_client_id()  # Utiliser le client de l'utilisateur connecté

    if not name:
        return jsonify({"success": False, "error": "Nom du projet requis"}), 400

    try:
        # Créer un repository GitLab pour le projet (avec isolation par client)
        gitlab_repo = create_gitlab_repository(
            name,
            f"Projet {template_type} créé via MoonOps",
            client_id
        )

        if not gitlab_repo:
            return jsonify({"success": False, "error": "Impossible de créer le repository GitLab"}), 500

        # Utiliser l'URL GitLab créée, ou garder l'URL originale si fournie
        final_repository_url = repository_url if repository_url else gitlab_repo['http_url']

        # Description enrichie
        project_description = f"Projet {template_type}"
        if repository_url:
            project_description += f" - Source Git: {repository_url}"
        project_description += f" - Repository GitLab: {gitlab_repo['name']}"

        # Insérer et récupérer l'ID
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO projects (client_id, name, description, template_type, status, repository_url)
                VALUES (%s, %s, %s, %s, 'PENDING', %s)
                RETURNING id
            """, (client_id, name, project_description, template_type, final_repository_url))
            new_project = cur.fetchone()
            conn.commit()
        conn.close()

        project_id = str(new_project['id']) if new_project else None

        return jsonify({
            "success": True,
            "message": f"Projet '{name}' créé avec succès dans GitLab !",
            "project_id": project_id,
            "gitlab_repo": {
                "name": gitlab_repo['name'],
                "web_url": gitlab_repo['web_url'],
                "ssh_url": gitlab_repo['ssh_url'],
                "http_url": gitlab_repo['http_url']
            }
        })
    except Exception as e:
        print(f"Erreur create_project: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Supprimer un projet (seulement si il appartient au client actuel)"""
    try:
        client_id = get_current_client_id()

        # Vérifier que le projet appartient au client actuel
        project_check = db_query("SELECT id FROM projects WHERE id = %s AND client_id = %s", (project_id, client_id), fetch_one=True)
        if not project_check:
            return jsonify({"success": False, "error": "Projet non trouvé ou accès non autorisé"}), 403

        # Supprimer d'abord les dépendances (environnements, pipelines, etc.)
        with get_db() as conn:
            with conn.cursor() as cur:
                # Supprimer les déploiements liés aux environnements du projet
                cur.execute("""
                    DELETE FROM deployments
                    WHERE environment_id IN (
                        SELECT id FROM environments WHERE project_id = %s
                    )
                """, (project_id,))

                # Supprimer les environnements
                cur.execute("DELETE FROM environments WHERE project_id = %s", (project_id,))

                # Supprimer les pipelines
                cur.execute("DELETE FROM pipelines WHERE project_id = %s", (project_id,))

                # Supprimer le projet
                cur.execute("DELETE FROM projects WHERE id = %s", (project_id,))

                conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Projet supprimé avec succès"
        })
    except Exception as e:
        print(f"Erreur delete_project: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/projects/upload', methods=['POST'])
def create_project_with_upload():
    """Créer un projet avec upload de fichier ZIP et/ou URL Git pour le client actuel"""
    try:
        name = request.form.get('name')
        template_type = request.form.get('template_type', 'web')
        git_url = request.form.get('git_url', '')  # URL Git optionnelle
        description = f"Projet {template_type}"  # Définir description ici
        client_id = get_current_client_id()  # Utiliser le client de l'utilisateur connecté

        if not name:
            return jsonify({"success": False, "error": "Nom du projet requis"}), 400
        
        # Gérer le fichier uploadé
        file_path = None
        file_size = 0
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                # Vérifier la taille du fichier avant sauvegarde
                file.seek(0, 2)  # Aller à la fin du fichier
                file_size = file.tell()
                file.seek(0)  # Retour au début

                if file_size > MAX_FILE_SIZE:
                    return jsonify({"success": False, "error": f"Fichier trop volumineux (max {MAX_FILE_SIZE / 1024 / 1024:.0f} MB)"}), 400

                filename = secure_filename(file.filename)
                # Ajouter timestamp pour éviter les collisions
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_filename = f"{timestamp}_{filename}"
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

                # Sauvegarder le fichier
                file.save(file_path)
                file_size = os.path.getsize(file_path)  # Vérification finale
                print(f"✅ Fichier sauvegardé: {file_path} ({file_size / 1024 / 1024:.2f} MB)")
            else:
                return jsonify({"success": False, "error": "Fichier ZIP invalide"}), 400
        
        # Traiter le code source et créer un repo GitLab
        gitlab_repo = None
        local_project_path = None
        final_repository_url = None

        try:
            # Créer d'abord le repository GitLab (avec isolation par client)
            gitlab_repo = create_gitlab_repository(
                name,
                f"Projet {template_type} créé via MoonOps",
                client_id
            )

            if not gitlab_repo:
                return jsonify({"success": False, "error": "Impossible de créer le repository GitLab"}), 500

            # Traiter selon la source
            if file_path:
                # Extraire le ZIP et pousser vers GitLab
                local_project_path = extract_zip_to_temp(file_path, name)
                if local_project_path:
                    success = initialize_git_repo(local_project_path, gitlab_repo['http_url'])
                    if not success:
                        return jsonify({"success": False, "error": "Impossible de pousser le code vers GitLab"}), 500
                    final_repository_url = gitlab_repo['http_url']
                else:
                    return jsonify({"success": False, "error": "Impossible d'extraire le fichier ZIP"}), 500

            elif git_url:
                # Pour les URLs Git existantes, on garde l'URL originale
                # (le clonage réel viendrait dans une phase ultérieure)
                final_repository_url = git_url
                print(f"ℹ️ URL Git référencée: {git_url}")

            else:
                # Repository GitLab vide (juste avec README)
                final_repository_url = gitlab_repo['http_url']
                print(f"✅ Repository GitLab vide créé: {gitlab_repo['web_url']}")

            # Créer le projet en BDD
            description = f"Projet {template_type} - Repository GitLab: {gitlab_repo['name']}"
            sources = []
            if git_url:
                sources.append(f"Source Git: {git_url}")
            if file_path:
                sources.append(f"Archive ZIP: {os.path.basename(file_path)}")
            if sources:
                description += f" ({', '.join(sources)})"

            # Insérer et récupérer l'ID
            conn = get_db()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO projects (client_id, name, description, template_type, status, repository_url)
                    VALUES (%s, %s, %s, %s, 'PENDING', %s)
                    RETURNING id
                """, (client_id, name, description, template_type, final_repository_url))
                new_project = cur.fetchone()
                conn.commit()
            conn.close()

            project_id = str(new_project['id']) if new_project else None

            return jsonify({
                "success": True,
                "message": f"Projet '{name}' créé avec succès dans GitLab !",
                "project_id": project_id,
                "gitlab_repo": {
                    "name": gitlab_repo['name'],
                    "web_url": gitlab_repo['web_url'],
                    "ssh_url": gitlab_repo['ssh_url'],
                    "http_url": gitlab_repo['http_url']
                },
                "file_uploaded": file_path is not None,
                "git_url": git_url if git_url else None,
                "file_size": f"{file_size / 1024 / 1024:.2f} MB" if file_size > 0 else None
            })

        except Exception as e:
            # Nettoyer en cas d'erreur
            if local_project_path and os.path.exists(local_project_path):
                import shutil
                shutil.rmtree(local_project_path)
            print(f"❌ Erreur création projet: {e}")
            return jsonify({"success": False, "error": str(e)}), 500
    except Exception as e:
        print(f"❌ Erreur create_project_with_upload: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================
# ROUTES DEPLOY (CI/CD)
# ============================================

@app.route('/api/deploy', methods=['POST'])
def deploy_project():
    """Lancer un déploiement (simulé mais enregistré) pour le client actuel"""
    data = request.json
    project_id = data.get('project_id')
    environment = data.get('environment', 'DEV')

    if not project_id:
        return jsonify({"success": False, "error": "ID du projet requis"}), 400

    try:
        client_id = get_current_client_id()

        # Vérifier que le projet appartient au client actuel
        project_check = db_query("SELECT id FROM projects WHERE id = %s AND client_id = %s", (project_id, client_id), fetch_one=True)
        if not project_check:
            return jsonify({"success": False, "error": "Projet non trouvé ou accès non autorisé"}), 403

        # Récupérer l'environnement ID (ou créer un mapping)
        env_mapping = {'DEV': 'DEVELOPMENT', 'STAGING': 'STAGING', 'PRODUCTION': 'PRODUCTION'}
        env_name = env_mapping.get(environment, 'DEVELOPMENT')
        
        # Récupérer ou créer l'environnement
        env_result = db_query("""
            SELECT id FROM environments WHERE project_id = %s AND name = %s
        """, (project_id, env_name), fetch_one=True)
        
        if not env_result:
            # Créer l'environnement s'il n'existe pas
            db_query("""
                INSERT INTO environments (project_id, name, url, status)
                VALUES (%s, %s, %s, 'RUNNING')
            """, (project_id, env_name, f"https://{env_name.lower()}.moonops.app"))
            env_result = db_query("""
                SELECT id FROM environments WHERE project_id = %s AND name = %s
            """, (project_id, env_name), fetch_one=True)
        
        env_id = env_result['id'] if env_result else None
        
        # Créer un pipeline
        db_query("""
            INSERT INTO pipelines (project_id, branch, status)
            VALUES (%s, 'main', 'SUCCESS')
        """, (project_id,))
        
        # Récupérer l'ID du pipeline créé
        pipeline_result = db_query("""
            SELECT id FROM pipelines WHERE project_id = %s ORDER BY started_at DESC LIMIT 1
        """, (project_id,), fetch_one=True)
        pipeline_id = str(pipeline_result['id']) if pipeline_result else f"pipe-{project_id}"
        
        # Créer un enregistrement de déploiement
        if env_id:
            version = f"v1.{datetime.now().strftime('%H%M%S')}"
            db_query("""
                INSERT INTO deployments (environment_id, version, status)
                VALUES (%s, %s, 'SUCCESS')
            """, (env_id, version))
        
        # Mettre à jour le projet
        db_query("""
            UPDATE projects SET status = 'ACTIVE', last_deployed_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (project_id,))
        
        return jsonify({
            "success": True,
            "message": f"Déploiement réussi sur {environment}! 🚀",
            "status": "SUCCESS",
            "pipeline_id": pipeline_id,
            "environment": env_name
        })
    except Exception as e:
        print(f"Erreur deploy_project: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/deployments', methods=['GET'])
def get_deployments():
    """Historique des déploiements récents pour le client actuel"""
    try:
        client_id = get_current_client_id()
        deployments = db_query("""
            SELECT
                d.id,
                d.version,
                d.status,
                d.deployed_at,
                e.name as environment,
                p.name as project_name,
                p.id as project_id
            FROM deployments d
            JOIN environments e ON d.environment_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE p.client_id = %s
            ORDER BY d.deployed_at DESC
            LIMIT 20
        """, (client_id,))
        
        if deployments:
            result = []
            for d in deployments:
                deploy_dict = dict(d)
                deploy_dict['id'] = str(deploy_dict['id'])
                deploy_dict['project_id'] = str(deploy_dict['project_id'])
                if deploy_dict.get('deployed_at'):
                    deploy_dict['deployed_at'] = deploy_dict['deployed_at'].isoformat()
                    # Calculer le temps relatif
                    delta = datetime.now() - d['deployed_at']
                    if delta.days > 0:
                        deploy_dict['time_ago'] = f"il y a {delta.days}j"
                    elif delta.seconds > 3600:
                        deploy_dict['time_ago'] = f"il y a {delta.seconds // 3600}h"
                    else:
                        deploy_dict['time_ago'] = f"il y a {delta.seconds // 60}min"
                result.append(deploy_dict)
            return jsonify(result)
        return jsonify([])
    except Exception as e:
        print(f"Erreur get_deployments: {str(e)}")
        return jsonify([])

@app.route('/api/pipelines', methods=['GET'])
def get_pipelines():
    """Liste des pipelines récents pour le client actuel"""
    try:
        client_id = get_current_client_id()
        pipelines = db_query("""
            SELECT p.id, p.branch, p.status, p.started_at, p.finished_at,
                   pr.name as project_name
            FROM pipelines p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.client_id = %s
            ORDER BY p.started_at DESC
            LIMIT 10
        """, (client_id,))
        
        if pipelines:
            result = []
            for p in pipelines:
                pipeline_dict = dict(p)
                pipeline_dict['id'] = str(pipeline_dict['id'])
                if pipeline_dict.get('started_at'):
                    pipeline_dict['started_at'] = pipeline_dict['started_at'].isoformat()
                if pipeline_dict.get('finished_at'):
                    pipeline_dict['finished_at'] = pipeline_dict['finished_at'].isoformat()
                result.append(pipeline_dict)
            return jsonify(result)
        return jsonify([])
    except Exception as e:
        print(f"Erreur get_pipelines: {str(e)}")
        return jsonify([])

# ============================================
# ROUTES STATS (Dashboard)
# ============================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Statistiques pour le dashboard du client actuel"""
    try:
        client_id = get_current_client_id()
        total_projects = db_query("SELECT COUNT(*) as count FROM projects WHERE client_id = %s", (client_id,), fetch_one=True)
        active_projects = db_query("SELECT COUNT(*) as count FROM projects WHERE client_id = %s AND status = 'ACTIVE'", (client_id,), fetch_one=True)
        total_deployments = db_query("SELECT COUNT(*) as count FROM deployments d JOIN projects p ON d.project_id = p.id WHERE p.client_id = %s", (client_id,), fetch_one=True)
        total_pipelines = db_query("SELECT COUNT(*) as count FROM pipelines p JOIN projects pr ON p.project_id = pr.id WHERE pr.client_id = %s AND p.status = 'SUCCESS'", (client_id,), fetch_one=True)
        total_alerts = db_query("SELECT COUNT(*) as count FROM alerts WHERE project_id IN (SELECT id FROM projects WHERE client_id = %s) AND status = 'ACTIVE'", (client_id,), fetch_one=True)

        stats = {
            "total_projects": total_projects['count'] if total_projects else 0,
            "active_projects": active_projects['count'] if active_projects else 0,
            "total_deployments": total_deployments['count'] if total_deployments else 0,
            "total_pipelines": total_pipelines['count'] if total_pipelines else 0,
            "total_alerts": total_alerts['count'] if total_alerts else 0,
            "success_rate": 98.2,
            "uptime": 99.9,
            "avg_response_time": 245  # ms
        }
        return jsonify(stats)
    except Exception as e:
        print(f"Erreur get_stats: {str(e)}")
        # Retourner des stats à zéro si erreur
        return jsonify({
            "total_projects": 0,
            "active_projects": 0,
            "total_deployments": 0,
            "total_pipelines": 0,
            "total_alerts": 0,
            "success_rate": 0,
            "uptime": 0,
            "avg_response_time": 0
        })

@app.route('/api/metrics/<project_id>', methods=['GET'])
def get_project_metrics(project_id):
    """Métriques d'un projet (CPU, mémoire, etc.)"""
    try:
        client_id = get_current_client_id()
        # Vérifier que le projet appartient au client actuel
        project_check = db_query("SELECT id FROM projects WHERE id = %s AND client_id = %s", (project_id, client_id), fetch_one=True)
        if not project_check:
            return jsonify({}), 403

        # Récupérer les métriques récentes (dernières 24h)
        metrics = db_query("""
            SELECT metric_name, value, timestamp
            FROM metrics
            WHERE project_id = %s
            AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
            ORDER BY timestamp ASC
        """, (project_id,))

        if metrics:
            result = {}
            for m in metrics:
                metric_name = m['metric_name']
                if metric_name not in result:
                    result[metric_name] = []
                result[metric_name].append({
                    'value': float(m['value']),
                    'timestamp': m['timestamp'].isoformat()
                })
            return jsonify(result)
        return jsonify({})
    except Exception as e:
        print(f"Erreur get_project_metrics: {str(e)}")
        return jsonify({})

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Liste des alertes actives pour le client actuel"""
    try:
        client_id = get_current_client_id()
        alerts = db_query("""
            SELECT a.id, a.severity, a.message, a.status, a.created_at, a.resolved_at,
                   p.name as project_name
            FROM alerts a
            JOIN projects p ON a.project_id = p.id
            WHERE a.status = 'ACTIVE' AND p.client_id = %s
            ORDER BY a.created_at DESC
            LIMIT 10
        """, (client_id,))

        if alerts:
            result = []
            for a in alerts:
                alert_dict = dict(a)
                alert_dict['id'] = str(alert_dict['id'])
                if alert_dict.get('created_at'):
                    alert_dict['created_at'] = alert_dict['created_at'].isoformat()
                if alert_dict.get('resolved_at'):
                    alert_dict['resolved_at'] = alert_dict['resolved_at'].isoformat()
                result.append(alert_dict)
            return jsonify(result)
        return jsonify([])
    except Exception as e:
        print(f"Erreur get_alerts: {str(e)}")
        return jsonify([])

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier que l'API fonctionne"""
    try:
        db_query("SELECT 1")
        db_status = "connected"
    except Exception as e:
        print(f"Erreur health: {str(e)}")
        db_status = "disconnected"
    
    return jsonify({
        "status": "ok",
        "database": db_status,
        "version": "1.0.0"
    })

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("🚀 MoonOps API démarré sur http://localhost:5000")
    print(f"📦 Base de données: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    print(f"🐙 GitLab URL: {GITLAB_URL}")
    print(f"🔑 GitLab Token: {GITLAB_TOKEN[:15]}..." if len(GITLAB_TOKEN) > 15 else f"🔑 GitLab Token: {GITLAB_TOKEN}")
    
    # Tester la connexion GitLab au démarrage
    try:
        test_response = requests.get(f"{GITLAB_URL}/api/{GITLAB_API_VERSION}/user", 
                                     headers={'PRIVATE-TOKEN': GITLAB_TOKEN},
                                     timeout=5)
        if test_response.status_code == 200:
            user = test_response.json()
            print(f"✅ GitLab connecté - Utilisateur: {user.get('name', 'Unknown')}")
        else:
            print(f"⚠️ GitLab accessible mais erreur d'authentification (HTTP {test_response.status_code})")
    except Exception as e:
        print(f"⚠️ GitLab non accessible: {e}")
        print("   💡 L'API fonctionnera mais la création de projets GitLab échouera")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
