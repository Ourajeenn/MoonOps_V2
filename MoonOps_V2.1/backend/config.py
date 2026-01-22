"""
Configuration PostgreSQL pour MoonOps
Base de données multi-tenant
"""

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "database": "moonops_appdb",
    "user": "moonops_app",
    "password": "moonops_app_2026!"
}

# Configuration Flask
FLASK_CONFIG = {
    "host": "0.0.0.0",
    "port": 5000,
    "debug": True
}

# CORS origins autorisées
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
]
