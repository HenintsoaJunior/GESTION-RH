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

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);

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