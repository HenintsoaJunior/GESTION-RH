-- Drop tables if they exist
DROP TABLE IF EXISTS menu_hierarchy;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS module;

-- Create table
CREATE TABLE module (
   module_id VARCHAR(50) PRIMARY KEY,
   module_name VARCHAR(100) NOT NULL,
   description VARCHAR(MAX),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE menu (
   menu_id VARCHAR(50) PRIMARY KEY,
   menu_key VARCHAR(50) NOT NULL UNIQUE,
   icon VARCHAR(50),
   link VARCHAR(255),
   is_enabled BIT DEFAULT 1,
   position INT,
   module_id VARCHAR(50),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (module_id) REFERENCES module(module_id)
);

CREATE TABLE menu_role (
   menu_id VARCHAR(50) NOT NULL,
   role_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (menu_id, role_id),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (role_id) REFERENCES role(role_id)
);

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);
-- Insert module utilisateur (au début)
INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('user', 'Utilisateurs', 'Gestion des utilisateurs et rôles', GETDATE(), GETDATE());

-- Insert menu utilisateur
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, created_at, updated_at) VALUES
('menu0', 'utilisateurs', 'fa-users', '/utilisateur', 1, 1, 'user', GETDATE(), GETDATE());

INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h0', NULL, 'menu0', GETDATE(), GETDATE());

---------------------------------------------------------
-- Module recrutement
INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('recruitment', 'Suivi du Recrutement', 'Gestion des candidatures, postes et filtres multicritères', GETDATE(), GETDATE());

INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, created_at, updated_at) VALUES
('menu1', 'recrutement', 'fa-user-plus', '/recruitment', 1, 2, 'recruitment', GETDATE(), GETDATE()),
('menu1_1', 'demande-creer', 'fa-plus', '/recruitment/recruitment-request/create', 1, 1, 'recruitment', GETDATE(), GETDATE()),
('menu1_2', 'demande-liste', 'fa-list', '/recruitment/recruitment-request/list', 1, 2, 'recruitment', GETDATE(), GETDATE());

INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h1', NULL, 'menu1', GETDATE(), GETDATE()),
('h2', 'menu1', 'menu1_1', GETDATE(), GETDATE()),
('h3', 'menu1', 'menu1_2', GETDATE(), GETDATE());

---------------------------------------------------------
-- Module mission
INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('mission', 'Suivi des Missions', 'Gestion des missions, assignations et paiements', GETDATE(), GETDATE());

INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, created_at, updated_at) VALUES
('menu2', 'mission', 'fa-briefcase', '/mission', 1, 3, 'mission', GETDATE(), GETDATE()),
('menu2_1', 'mission-liste', 'fa-list', '/mission/list', 1, 1, 'mission', GETDATE(), GETDATE()),
('menu2_2', 'beneficiaire-liste', 'fa-users', '/mission/beneficiary', 1, 2, 'mission', GETDATE(), GETDATE()),
('menu2_3', 'mission-excel', 'fa-file-excel', '/assignments/excel', 1, 3, 'mission', GETDATE(), GETDATE());

INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h4', NULL, 'menu2', GETDATE(), GETDATE()),
('h5', 'menu2', 'menu2_1', GETDATE(), GETDATE()),
('h6', 'menu2', 'menu2_2', GETDATE(), GETDATE()),
('h7', 'menu2', 'menu2_3', GETDATE(), GETDATE());

---------------------------------------------------------
-- Roles associés
INSERT INTO menu_role (menu_id, role_id, created_at, updated_at) VALUES
-- Utilisateur
('menu0', 'ROLE_001', GETDATE(), GETDATE()),

-- Recrutement
('menu1', 'ROLE_001', GETDATE(), GETDATE()),
('menu1_1', 'ROLE_001', GETDATE(), GETDATE()),
('menu1_2', 'ROLE_001', GETDATE(), GETDATE()),

-- Mission
('menu2', 'ROLE_001', GETDATE(), GETDATE()),
('menu2_1', 'ROLE_001', GETDATE(), GETDATE()),
('menu2_2', 'ROLE_001', GETDATE(), GETDATE()),
('menu2_3', 'ROLE_001', GETDATE(), GETDATE());
