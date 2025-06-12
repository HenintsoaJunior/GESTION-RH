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
   is_active BIT DEFAULT 1
);

CREATE TABLE module (
   module_id VARCHAR(50) PRIMARY KEY,
   module_name VARCHAR(100) NOT NULL,
   description VARCHAR(MAX)
);

CREATE TABLE menu (
   menu_id VARCHAR(50) PRIMARY KEY,
   menu_key VARCHAR(50) NOT NULL UNIQUE,
   icon VARCHAR(50),
   link VARCHAR(255),
   is_enabled BIT DEFAULT 1,
   position INT,
   module_id VARCHAR(50),
   FOREIGN KEY (module_id) REFERENCES module(module_id)
);

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);

CREATE TABLE menu_translation (
   translation_id VARCHAR(50) PRIMARY KEY,
   label VARCHAR(100) NOT NULL,
   language_id VARCHAR(10) NOT NULL,
   menu_id VARCHAR(50) NOT NULL,
   UNIQUE (menu_id, language_id),
   FOREIGN KEY (language_id) REFERENCES language(language_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);




-- Insert languages with country_code (Français et Malgache)
INSERT INTO language (language_id, language_name, abr, country_code, is_active) VALUES
('fr', 'Français', 'FR', 'FR', 1),
('mg', 'Malgache', 'MG', 'MG', 1);


-- Insert modules (inchangé)
INSERT INTO module (module_id, module_name, description) VALUES
('recruitment', 'Suivi du Recrutement', 'Gestion des candidatures, postes et filtres multicritères');


-- Insert menus
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id) VALUES
('menu1', 'recruitment', 'fa-user-plus', '/recruitment', 1, 1, 'recruitment'),
('menu1_1', 'demande-recruitement', 'fa-users', '/recruitment/recruitment-request', 1, 1, 'recruitment');


-- Insert menu hierarchy
INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id) VALUES
('h1', NULL, 'menu1'),
('h2', 'menu1', 'menu1_1');


-- Insert menu translations (Français et Malgache)
INSERT INTO menu_translation (translation_id, label, language_id, menu_id) VALUES
('t1', 'Suivi du Recrutement', 'fr', 'menu1'),
('t2', 'Fanarahamaso ny Fandraisana Mpiasa', 'mg', 'menu1'),
('t3', 'Demande de Recrutement', 'fr', 'menu1_1'),
('t4', 'Fangatahana Asa', 'mg', 'menu1_1');

-- -- Insert languages with country_code
-- INSERT INTO language (language_id, language_name, abr, country_code, is_active) VALUES
-- ('fr', 'Français', 'FR', 'FR', 1),
-- ('en', 'English', 'EN', 'GB', 1);

-- -- Insert modules (unchanged)
-- INSERT INTO module (module_id, module_name, description) VALUES
-- ('recrutement', 'Suivi du Recrutement', 'Gestion des candidatures, postes et filtres multicritères'),
-- ('admin_rh', 'Gestion Administrative RH', 'Téléversement et génération des documents RH'),
-- ('sanctions', 'Sanctions RH', 'Enregistrement, classification et archivage des sanctions'),
-- ('ged_rh', 'GED RH', 'Classement et recherche sécurisée de documents RH'),
-- ('kpi', 'Tableau de bord RH', 'Indicateurs clés de pilotage RH');

-- -- Insert menus (unchanged)
-- INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id) VALUES
-- ('menu1', 'recrutement', 'fa-user-plus', '/recrutement', 1, 1, 'recrutement'),
-- ('menu1_1', 'candidatures', 'fa-users', '/recrutement/candidatures', 1, 1, 'recrutement'),
-- ('menu1_2', 'entretiens', 'fa-calendar-check', '/recrutement/entretiens', 1, 2, 'recrutement'),
-- ('menu1_3', 'offres', 'fa-briefcase', '/recrutement/offres', 1, 3, 'recrutement'),
-- ('menu2', 'admin_rh', 'fa-file-signature', '/admin', 1, 2, 'admin_rh'),
-- ('menu2_1', 'documents', 'fa-file-upload', '/admin/documents', 1, 1, 'admin_rh'),
-- ('menu2_2', 'contrats', 'fa-file-contract', '/admin/contrats', 1, 2, 'admin_rh'),
-- ('menu3', 'sanctions', 'fa-exclamation-triangle', '/sanctions', 1, 3, 'sanctions'),
-- ('menu3_1', 'nouvelle_sanction', 'fa-plus-circle', '/sanctions/nouvelle', 1, 1, 'sanctions'),
-- ('menu3_2', 'archives_sanctions', 'fa-folder', '/sanctions/archives', 1, 2, 'sanctions'),
-- ('menu4', 'ged_rh', 'fa-archive', '/ged', 1, 4, 'ged_rh'),
-- ('menu4_1', 'recherche_docs', 'fa-search', '/ged/recherche', 1, 1, 'ged_rh'),
-- ('menu4_2', 'categories_docs', 'fa-folder-open', '/ged/categories', 1, 2, 'ged_rh'),
-- ('menu5', 'dashboard', 'fa-chart-bar', '/dashboard', 1, 5, 'kpi'),
-- ('menu5_1', 'stats_recrutement', 'fa-chart-line', '/dashboard/recrutement', 1, 1, 'kpi'),
-- ('menu5_2', 'stats_performance', 'fa-chart-pie', '/dashboard/performance', 1, 2, 'kpi');

-- -- Insert menu hierarchy (unchanged)
-- INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id) VALUES
-- ('h1', NULL, 'menu1'),
-- ('h2', 'menu1', 'menu1_1'),
-- ('h3', 'menu1', 'menu1_2'),
-- ('h4', 'menu1', 'menu1_3'),
-- ('h5', NULL, 'menu2'),
-- ('h6', 'menu2', 'menu2_1'),
-- ('h7', 'menu2', 'menu2_2'),
-- ('h8', NULL, 'menu3'),
-- ('h9', 'menu3', 'menu3_1'),
-- ('h10', 'menu3', 'menu3_2'),
-- ('h11', NULL, 'menu4'),
-- ('h12', 'menu4', 'menu4_1'),
-- ('h13', 'menu4', 'menu4_2'),
-- ('h14', NULL, 'menu5'),
-- ('h15', 'menu5', 'menu5_1'),
-- ('h16', 'menu5', 'menu5_2');

-- -- Insert menu translations (unchanged)
-- INSERT INTO menu_translation (translation_id, label, language_id, menu_id) VALUES
-- ('t1', 'Suivi du Recrutement', 'fr', 'menu1'),
-- ('t2', 'Recruitment Tracking', 'en', 'menu1'),
-- ('t3', 'Candidatures', 'fr', 'menu1_1'),
-- ('t4', 'Applications', 'en', 'menu1_1'),
-- ('t5', 'Entretiens', 'fr', 'menu1_2'),
-- ('t6', 'Interviews', 'en', 'menu1_2'),
-- ('t7', 'Offres d''emploi', 'fr', 'menu1_3'),
-- ('t8', 'Job Offers', 'en', 'menu1_3'),
-- ('t9', 'Gestion Administrative RH', 'fr', 'menu2'),
-- ('t10', 'HR Administrative Management', 'en', 'menu2'),
-- ('t11', 'Documents', 'fr', 'menu2_1'),
-- ('t12', 'Documents', 'en', 'menu2_1'),
-- ('t13', 'Contrats', 'fr', 'menu2_2'),
-- ('t14', 'Contracts', 'en', 'menu2_2'),
-- ('t15', 'Sanctions RH', 'fr', 'menu3'),
-- ('t16', 'HR Sanctions', 'en', 'menu3'),
-- ('t17', 'Nouvelle Sanction', 'fr', 'menu3_1'),
-- ('t18', 'New Sanction', 'en', 'menu3_1'),
-- ('t19', 'Archives des Sanctions', 'fr', 'menu3_2'),
-- ('t20', 'Sanctions Archive', 'en', 'menu3_2'),
-- ('t21', 'GED RH', 'fr', 'menu4'),
-- ('t22', 'HR DMS', 'en', 'menu4'),
-- ('t23', 'Recherche de Documents', 'fr', 'menu4_1'),
-- ('t24', 'Document Search', 'en', 'menu4_1'),
-- ('t25', 'Catégories de Documents', 'fr', 'menu4_2'),
-- ('t26', 'Document Categories', 'en', 'menu4_2'),
-- ('t27', 'Tableau de bord RH', 'fr', 'menu5'),
-- ('t28', 'HR Dashboard', 'en', 'menu5'),
-- ('t29', 'Statistiques de Recrutement', 'fr', 'menu5_1'),
-- ('t30', 'Recruitment Statistics', 'en', 'menu5_1'),
-- ('t31', 'Statistiques de Performance', 'fr', 'menu5_2'),
-- ('t32', 'Performance Statistics', 'en', 'menu5_2');


