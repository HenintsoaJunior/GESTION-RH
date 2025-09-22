-- ============================
-- Table: module
-- ============================
CREATE TABLE module (
   module_id VARCHAR(50) PRIMARY KEY,
   module_name VARCHAR(100) NOT NULL,
   description VARCHAR(MAX),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- ============================
-- Table: menu
-- ============================
CREATE TABLE menu (
   menu_id VARCHAR(50) PRIMARY KEY,
   menu_key VARCHAR(50) NOT NULL UNIQUE,
   icon VARCHAR(50),
   link VARCHAR(255),
   is_enabled BIT DEFAULT 1,
   position INT,
   module_id VARCHAR(50),
   section VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (module_id) REFERENCES module(module_id)
);

-- ============================
-- Table: menu_role
-- ============================
CREATE TABLE menu_role (
   menu_id VARCHAR(50) NOT NULL,
   role_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (menu_id, role_id),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (role_id) REFERENCES role(role_id)
);

-- ============================
-- Table: menu_hierarchy
-- ============================
CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);

-- ============================
-- Insert modules
-- ============================
INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('user', 'Utilisateurs', 'Gestion des utilisateurs et rôles', GETDATE(), GETDATE()),
('habilitation', 'Habilitation', 'Gestion des habilitations et autorisations', GETDATE(), GETDATE()),
('mission', 'Suivi des Missions', 'Gestion des missions, assignations et paiements', GETDATE(), GETDATE()),
('logs', 'Logs', 'Suivi et journalisation des actions utilisateurs et systèmes', GETDATE(), GETDATE()),
('recrutement', 'Recrutement', 'Gestion du processus de recrutement et des demandes', GETDATE(), GETDATE());

-- ============================
-- Insert menus (avec section)
-- ============================
-- Administration: utilisateur
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at) VALUES
('menu0', 'utilisateurs', 'fa-users', '/utilisateur', 1, 1, 'user', 'administration', GETDATE(), GETDATE());

-- Administration: habilitation
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at) VALUES
('menu_hab', 'habilitation', 'fa-shield-alt', '/habilitation', 1, 2, 'habilitation', 'administration', GETDATE(), GETDATE()),
('menu_hab_2', 'role', 'fa-list', '/role/list', 1, 3, 'habilitation', 'administration', GETDATE(), GETDATE());

-- Administration: logs
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at) VALUES
('menu_logs', 'logs', 'fa-file-alt', '/logs', 1, 4, 'logs', 'administration', GETDATE(), GETDATE());

-- Navigation: mission
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at) VALUES
('menu2', 'mission', 'fa-briefcase', '/mission', 1, 2, 'mission', 'navigation', GETDATE(), GETDATE()),
('menu2_0', 'mission-a-valider', 'fa-tasks', '/mission/to-validate', 1, 1, 'mission', 'navigation', GETDATE(), GETDATE()),
('menu2_3', 'collaborateur', 'fa-users', '/mission/collaborateur', 1, 4, 'mission', 'navigation', GETDATE(), GETDATE()),
('menu2_4', 'excel', 'fa-file-excel', '/assignments/excel', 1, 5, 'mission', 'navigation', GETDATE(), GETDATE());

-- Navigation: recrutement
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at) VALUES
('menu_recrutement', 'recrutement', 'fa-user-tie', '/recrutement', 1, 6, 'recrutement', 'navigation', GETDATE(), GETDATE()),
('menu_recrutement_validation', 'validation', 'fa-check-circle', '/recrutement/validation', 1, 1, 'recrutement', 'navigation', GETDATE(), GETDATE()),
('menu_recrutement_demande', 'demande', 'fa-file-signature', '/recrutement/demande', 1, 2, 'recrutement', 'navigation', GETDATE(), GETDATE()),
('menu_recrutement_fiche', 'fiche-de-poste', 'fa-id-card', '/recrutement/job/job-offer', 1, 3, 'recrutement', 'navigation', GETDATE(), GETDATE());

-- ============================
-- Insert menu hierarchy
-- ============================
INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h0', NULL, 'menu0', GETDATE(), GETDATE()),
('h_hab', NULL, 'menu_hab', GETDATE(), GETDATE()),
('h_hab_2', 'menu_hab', 'menu_hab_2', GETDATE(), GETDATE()),
('h_logs', NULL, 'menu_logs', GETDATE(), GETDATE()),
('h4', NULL, 'menu2', GETDATE(), GETDATE()),
('h2_0', 'menu2', 'menu2_0', GETDATE(), GETDATE()),
('h6', 'menu2', 'menu2_3', GETDATE(), GETDATE()),
('h7', 'menu2', 'menu2_4', GETDATE(), GETDATE()),
('h_recrutement', NULL, 'menu_recrutement', GETDATE(), GETDATE()),
('h_recrutement_validation', 'menu_recrutement', 'menu_recrutement_validation', GETDATE(), GETDATE()),
('h_recrutement_demande', 'menu_recrutement', 'menu_recrutement_demande', GETDATE(), GETDATE()),
('h_recrutement_fiche', 'menu_recrutement', 'menu_recrutement_fiche', GETDATE(), GETDATE());

-- ============================
-- Insert menu roles
-- ============================
INSERT INTO menu_role (menu_id, role_id, created_at, updated_at) VALUES
-- Utilisateur
('menu0', 'ROLE_001', GETDATE(), GETDATE()),
-- Habilitation
('menu_hab', 'ROLE_001', GETDATE(), GETDATE()),
('menu_hab_2', 'ROLE_001', GETDATE(), GETDATE()),
-- Logs
('menu_logs', 'ROLE_001', GETDATE(), GETDATE()),
-- Mission
('menu2', 'ROLE_001', GETDATE(), GETDATE()),
('menu2_0', 'ROLE_001', GETDATE(), GETDATE()),
('menu2_3', 'ROLE_001', GETDATE(), GETDATE()),
('menu2_4', 'ROLE_001', GETDATE(), GETDATE()),
-- Recrutement
('menu_recrutement', 'ROLE_001', GETDATE(), GETDATE()),
('menu_recrutement_validation', 'ROLE_001', GETDATE(), GETDATE()),
('menu_recrutement_demande', 'ROLE_001', GETDATE(), GETDATE()),
('menu_recrutement_fiche', 'ROLE_001', GETDATE(), GETDATE());
