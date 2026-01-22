-- ==========================================
-- MoonOps Platform - PostgreSQL Database Schema
-- Multi-Tenant Isolation & DevOps Management
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENUM TYPES
-- ==========================================
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'DEVELOPER', 'VIEWER');
CREATE TYPE project_status AS ENUM ('ACTIVE', 'PENDING', 'MAINTENANCE', 'ARCHIVED');
CREATE TYPE pipeline_status AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');
CREATE TYPE deployment_status AS ENUM ('SUCCESS', 'FAILED', 'ROLLED_BACK', 'IN_PROGRESS');
CREATE TYPE alert_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE environment_status AS ENUM ('RUNNING', 'STOPPED', 'ERROR');
CREATE TYPE invoice_status AS ENUM ('PAID', 'PENDING', 'OVERDUE', 'CANCELLED');

-- ==========================================
-- TABLES
-- ==========================================

-- 1. CLIENTS (Tenants)
-- Isolation at the root level
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'DEVELOPER',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL, -- e.g., 'web', 'api', 'mobile'
    status project_status NOT NULL DEFAULT 'PENDING',
    repository_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_deployed_at TIMESTAMP WITH TIME ZONE
);

-- 4. ENVIRONMENTS
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'DEVELOPMENT', 'STAGING', 'PRODUCTION'
    url TEXT,
    status environment_status DEFAULT 'STOPPED', -- RUNNING, STOPPED, ERROR
    config_json JSONB DEFAULT '{}', -- Environment specific variables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PIPELINES
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id),
    branch TEXT NOT NULL,
    commit_sha TEXT,
    status pipeline_status NOT NULL DEFAULT 'RUNNING',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER
);

-- 6. DEPLOYMENTS
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    version_tag TEXT NOT NULL,
    status deployment_status NOT NULL,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    health_check_passed BOOLEAN DEFAULT TRUE
);

-- 7. MONITORING ALERTS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    severity alert_severity NOT NULL,
    message TEXT NOT NULL,
    status alert_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 8. PROJECT METRICS (Time-series data vibe)
CREATE TABLE metrics (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL, -- 'cpu_usage', 'memory_usage', 'latency'
    value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. BILLING & INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status invoice_status NOT NULL DEFAULT 'PENDING',
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 10. AUDIT LOGS (Administration Tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR PERFORMANCE & ISOLATION
-- ==========================================
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_pipelines_project_id ON pipelines(project_id);
CREATE INDEX idx_deployments_project_id ON deployments(project_id);
CREATE INDEX idx_alerts_project_id ON alerts(project_id);
CREATE INDEX idx_metrics_project_timestamp ON metrics(project_id, timestamp DESC);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION
-- Strict isolation per client_id
-- ==========================================

-- Define a function to get the current tenant ID from the session
CREATE OR REPLACE FUNCTION get_current_client_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_client_id', true)::UUID;
$$ LANGUAGE sql STABLE;

-- Enable RLS on all tables requiring isolation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. USERS Policy
CREATE POLICY client_isolation_users ON users
    FOR ALL
    USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

-- 2. PROJECTS Policy
CREATE POLICY client_isolation_projects ON projects
    FOR ALL
    USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

-- 3. ENVIRONMENTS Policy (via project_id)
CREATE POLICY client_isolation_environments ON environments
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = environments.project_id 
        AND p.client_id = get_current_client_id()
    ));

-- 4. PIPELINES Policy
CREATE POLICY client_isolation_pipelines ON pipelines
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = pipelines.project_id 
        AND p.client_id = get_current_client_id()
    ));

-- 5. DEPLOYMENTS Policy
CREATE POLICY client_isolation_deployments ON deployments
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = deployments.project_id 
        AND p.client_id = get_current_client_id()
    ));

-- 6. ALERTS Policy
CREATE POLICY client_isolation_alerts ON alerts
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = alerts.project_id 
        AND p.client_id = get_current_client_id()
    ));

-- 7. METRICS Policy
CREATE POLICY client_isolation_metrics ON metrics
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = metrics.project_id 
        AND p.client_id = get_current_client_id()
    ));

-- 8. INVOICES Policy
CREATE POLICY client_isolation_invoices ON invoices
    FOR ALL
    USING (client_id = get_current_client_id());

-- 9. AUDIT_LOGS Policy
CREATE POLICY client_isolation_audit_logs ON audit_logs
    FOR ALL
    USING (client_id = get_current_client_id());

-- ==========================================
-- CONFIGURATION EXAMPLE / USAGE
-- ==========================================
/*
  Pour utiliser l'isolation dans vos requêtes Node/Python :
  
  BEGIN;
  SET LOCAL app.current_client_id = 'e1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5';
  SELECT * FROM projects; -- Ne retourne que les projets de ce client
  COMMIT;
*/

-- ==========================================
-- INITIAL SEED DATA (Demo)
-- ==========================================

-- Insert TechConsulting as a client
INSERT INTO clients (id, name, slug) VALUES
('fcb79070-fca6-4367-8f74-fa138223fa97', 'TechConsulting Gp', 'techconsulting'),
('ae89d37b-8b81-46d4-acf4-9bf17e3342db', 'ClientA Corp', 'clienta'),
('ff8f1b6d-8afc-4abf-97e4-22b73f69343a', 'ClientB Solutions', 'clientb');

-- Insert users with real password hash for 'demo2026'
INSERT INTO users (client_id, email, full_name, password_hash, role, is_active, last_login, created_at) VALUES
('fcb79070-fca6-4367-8f74-fa138223fa97', 'admin@techconsulting.fr', 'System Admin', '$2b$12$FQubdzAi63yC.bObtJUZB.Ssmgn2x6lnhnvALuvrWqPRzivowrfue', 'SUPERADMIN', true, NULL, CURRENT_TIMESTAMP),

-- ClientA users
('ae89d37b-8b81-46d4-acf4-9bf17e3342db', 'admin@clienta.com', 'ClientA Admin', '$2b$12$FQubdzAi63yC.bObtJUZB.Ssmgn2x6lnhnvALuvrWqPRzivowrfue', 'ADMIN', true, NULL, CURRENT_TIMESTAMP),
('ae89d37b-8b81-46d4-acf4-9bf17e3342db', 'dev@clienta.com', 'ClientA Developer', '$2b$12$FQubdzAi63yC.bObtJUZB.Ssmgn2x6lnhnvALuvrWqPRzivowrfue', 'DEVELOPER', true, NULL, CURRENT_TIMESTAMP),

-- ClientB users
('ff8f1b6d-8afc-4abf-97e4-22b73f69343a', 'admin@clientb.com', 'ClientB Admin', '$2b$12$FQubdzAi63yC.bObtJUZB.Ssmgn2x6lnhnvALuvrWqPRzivowrfue', 'ADMIN', true, NULL, CURRENT_TIMESTAMP),
('ff8f1b6d-8afc-4abf-97e4-22b73f69343a', 'dev@clientb.com', 'ClientB Developer', '$2b$12$FQubdzAi63yC.bObtJUZB.Ssmgn2x6lnhnvALuvrWqPRzivowrfue', 'DEVELOPER', true, NULL, CURRENT_TIMESTAMP);

-- Insert initial projects with realistic data
INSERT INTO projects (id, client_id, name, description, template_type, status, repository_url, created_at, last_deployed_at) VALUES
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'fcb79070-fca6-4367-8f74-fa138223fa97', 'E-Commerce Platform', 'Plateforme e-commerce avec panier intelligent et paiement sécurisé', 'web', 'ACTIVE', 'https://github.com/demo/ecommerce-platform.git', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'fcb79070-fca6-4367-8f74-fa138223fa97', 'API Gateway Service', 'Microservice API Gateway avec authentification OAuth2', 'api', 'ACTIVE', 'https://github.com/demo/api-gateway.git', CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('70745fc4-998b-482c-910b-5f72cdbb6134', 'fcb79070-fca6-4367-8f74-fa138223fa97', 'Mobile Banking App', 'Application mobile bancaire avec biométrie', 'mobile', 'PENDING', 'https://github.com/demo/mobile-banking.git', CURRENT_TIMESTAMP - INTERVAL '15 days', NULL),
('474178f1-f083-432b-9847-e1a5478591d1', 'fcb79070-fca6-4367-8f74-fa138223fa97', 'Data Analytics Dashboard', 'Dashboard d''analyse de données temps réel', 'web', 'ACTIVE', 'https://github.com/demo/analytics-dashboard.git', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('e8d5a6ed-b100-4be1-ade7-6176be4aafcf', 'fcb79070-fca6-4367-8f74-fa138223fa97', 'IoT Monitoring System', 'Système de monitoring IoT avec alertes intelligentes', 'api', 'MAINTENANCE', 'https://github.com/demo/iot-monitoring.git', CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- ClientA projects
('c13caebb-5204-400e-8922-57daf2c22aa4', 'ae89d37b-8b81-46d4-acf4-9bf17e3342db', 'CRM System', 'Système de gestion de la relation client', 'web', 'ACTIVE', 'https://gitlab.com/clienta/crm-system.git', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('689b92a4-ae82-4d61-bd4e-62d007b3ea58', 'ae89d37b-8b81-46d4-acf4-9bf17e3342db', 'Inventory API', 'API de gestion des inventaires', 'api', 'ACTIVE', 'https://gitlab.com/clienta/inventory-api.git', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- ClientB projects
('c881a92c-0a53-4aba-973a-3d1c968f28b8', 'ff8f1b6d-8afc-4abf-97e4-22b73f69343a', 'Booking Platform', 'Plateforme de réservation en ligne', 'web', 'PENDING', 'https://gitlab.com/clientb/booking-platform.git', CURRENT_TIMESTAMP - INTERVAL '8 days', NULL),
('82efe5f1-b924-4821-bb13-ae9373e5af07', 'ff8f1b6d-8afc-4abf-97e4-22b73f69343a', 'Payment Gateway', 'Passerelle de paiement sécurisée', 'api', 'ACTIVE', 'https://gitlab.com/clientb/payment-gateway.git', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '4 hours');

-- Insert environments for projects
INSERT INTO environments (project_id, name, url, status, config_json, is_active) VALUES
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'DEVELOPMENT', 'https://dev-ecommerce.moonops.app', 'RUNNING', '{"cpu_limit": "2", "memory_limit": "4GB"}', true),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'STAGING', 'https://staging-ecommerce.moonops.app', 'RUNNING', '{"cpu_limit": "4", "memory_limit": "8GB"}', true),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'PRODUCTION', 'https://ecommerce.moonops.app', 'RUNNING', '{"cpu_limit": "8", "memory_limit": "16GB"}', true),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'DEVELOPMENT', 'https://dev-api.moonops.app', 'RUNNING', '{"cpu_limit": "1", "memory_limit": "2GB"}', true),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'PRODUCTION', 'https://api.moonops.app', 'RUNNING', '{"cpu_limit": "4", "memory_limit": "8GB"}', true),
('474178f1-f083-432b-9847-e1a5478591d1', 'DEVELOPMENT', 'https://dev-analytics.moonops.app', 'RUNNING', '{"cpu_limit": "2", "memory_limit": "6GB"}', true),
('474178f1-f083-432b-9847-e1a5478591d1', 'PRODUCTION', 'https://analytics.moonops.app', 'RUNNING', '{"cpu_limit": "6", "memory_limit": "12GB"}', true);

-- Insert pipelines
INSERT INTO pipelines (project_id, branch, status, started_at, finished_at, commit_sha, triggered_by) VALUES
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'main', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours' + INTERVAL '15 minutes', 'a1b2c3d4e5f6', 'fcb79070-fca6-4367-8f74-fa138223fa97'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'feature/cart-checkout', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours' + INTERVAL '12 minutes', 'b2c3d4e5f6g7', 'fcb79070-fca6-4367-8f74-fa138223fa97'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'main', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours' + INTERVAL '8 minutes', 'c3d4e5f6g7h8', 'fcb79070-fca6-4367-8f74-fa138223fa97'),
('474178f1-f083-432b-9847-e1a5478591d1', 'main', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '18 minutes', 'd4e5f6g7h8i9', 'fcb79070-fca6-4367-8f74-fa138223fa97');

-- Insert deployments
INSERT INTO deployments (project_id, environment_id, version_tag, status, deployed_at, health_check_passed) VALUES
('8ef6433b-376f-40d7-ab82-323b2f3e8966', (SELECT id FROM environments WHERE project_id = '8ef6433b-376f-40d7-ab82-323b2f3e8966' AND name = 'PRODUCTION'), 'v2.1.15', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '2 hours', true),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', (SELECT id FROM environments WHERE project_id = '8ef6433b-376f-40d7-ab82-323b2f3e8966' AND name = 'STAGING'), 'v2.1.14', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '6 hours', true),
('1c58c4df-86ef-4198-9390-60c844b28ce7', (SELECT id FROM environments WHERE project_id = '1c58c4df-86ef-4198-9390-60c844b28ce7' AND name = 'PRODUCTION'), 'v1.8.3', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '6 hours', true),
('474178f1-f083-432b-9847-e1a5478591d1', (SELECT id FROM environments WHERE project_id = '474178f1-f083-432b-9847-e1a5478591d1' AND name = 'PRODUCTION'), 'v3.2.1', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1 day', true);

-- Insert alerts
INSERT INTO alerts (project_id, severity, message, status, created_at, resolved_at) VALUES
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'WARNING', 'Utilisation CPU élevée (85%) sur production', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL),
('474178f1-f083-432b-9847-e1a5478591d1', 'CRITICAL', 'Erreur de connexion base de données', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('e8d5a6ed-b100-4be1-ade7-6176be4aafcf', 'INFO', 'Maintenance programmée ce weekend', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL);

-- Insert sample metrics (last 24 hours)
INSERT INTO metrics (project_id, metric_name, value, timestamp) VALUES
-- E-commerce CPU usage over last 24h
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 45.2, CURRENT_TIMESTAMP - INTERVAL '24 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 52.1, CURRENT_TIMESTAMP - INTERVAL '20 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 78.3, CURRENT_TIMESTAMP - INTERVAL '16 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 85.7, CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 62.4, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 71.8, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'cpu_usage', 58.9, CURRENT_TIMESTAMP),

-- E-commerce Memory usage
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 2.1, CURRENT_TIMESTAMP - INTERVAL '24 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 2.8, CURRENT_TIMESTAMP - INTERVAL '20 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 4.2, CURRENT_TIMESTAMP - INTERVAL '16 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 4.8, CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 3.6, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 4.1, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('8ef6433b-376f-40d7-ab82-323b2f3e8966', 'memory_usage', 3.2, CURRENT_TIMESTAMP),

-- API Gateway response time
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 45, CURRENT_TIMESTAMP - INTERVAL '24 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 52, CURRENT_TIMESTAMP - INTERVAL '20 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 78, CURRENT_TIMESTAMP - INTERVAL '16 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 85, CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 62, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 71, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('1c58c4df-86ef-4198-9390-60c844b28ce7', 'response_time', 58, CURRENT_TIMESTAMP);
