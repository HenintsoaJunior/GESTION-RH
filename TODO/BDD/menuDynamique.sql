-- Drop tables if they exist
DROP TABLE IF EXISTS menu_translation;
DROP TABLE IF EXISTS menu_hierarchy;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS module;
DROP TABLE IF EXISTS language;

-- Create tables
CREATE TABLE language (
   language_id VARCHAR(10) PRIMARY KEY,
   language_name VARCHAR(100) NOT NULL,
   abr VARCHAR(50) NOT NULL,
   country_code VARCHAR(5),
   is_active BIT DEFAULT 1,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

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

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);

CREATE TABLE menu_translation (
   translation_id VARCHAR(50) PRIMARY KEY,
   label VARCHAR(100) NOT NULL,
   language_id VARCHAR(10) NOT NULL,
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   UNIQUE (menu_id, language_id),
   FOREIGN KEY (language_id) REFERENCES language(language_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);

-- Insert languages with country_code (Français et Malgache)
INSERT INTO language (language_id, language_name, abr, country_code, is_active, created_at, updated_at) VALUES
('fr', 'Français', 'FR', 'FR', 1, GETDATE(), GETDATE()),
('mg', 'Malgache', 'MG', 'MG', 1, GETDATE(), GETDATE());

-- Insert modules
INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('recruitment', 'Suivi du Recrutement', 'Gestion des candidatures, postes et filtres multicritères', GETDATE(), GETDATE());

-- Insert menus
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, created_at, updated_at) VALUES
('menu1', 'recruitment', 'fa-user-plus', '/recruitment', 1, 1, 'recruitment', GETDATE(), GETDATE()),
('menu1_1', 'demande-recrutement', 'fa-users', '/recruitment/recruitment-request', 1, 1, 'recruitment', GETDATE(), GETDATE());

-- Insert menu hierarchy
INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h1', NULL, 'menu1', GETDATE(), GETDATE()),
('h2', 'menu1', 'menu1_1', GETDATE(), GETDATE());

-- Insert menu translations (Français et Malgache)
INSERT INTO menu_translation (translation_id, label, language_id, menu_id, created_at, updated_at) VALUES
('t1', 'Suivi du Recrutement', 'fr', 'menu1', GETDATE(), GETDATE()),
('t2', 'Fanarahamaso ny Fandraisana Mpiasa', 'mg', 'menu1', GETDATE(), GETDATE()),
('t3', 'Demande de Recrutement', 'fr', 'menu1_1', GETDATE(), GETDATE()),
('t4', 'Fangatahana Asa', 'mg', 'menu1_1', GETDATE(), GETDATE());
