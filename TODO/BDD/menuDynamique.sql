-- Insertion des langues
INSERT INTO Language (language_id, language_name) VALUES
('fr', 'Français'),
('en', 'English');

-- Insertion d'un module
INSERT INTO Module (module_name, description) VALUES
('Comptabilité', 'Gestion des finances et rapports');

-- Insertion des éléments de menu
INSERT INTO Menu (module_id, menu_key, icon, link, position) VALUES
(1, 'dashboard', 'fa-home', '/dashboard', 1),
(1, 'reports', 'fa-chart-bar', '/reports', 2);

-- Insertion de la hiérarchie (Rapports est un sous-menu de Dashboard)
INSERT INTO MenuHierarchy (menu_id, parent_menu_id) VALUES
(2, 1);

-- Insertion des traductions
INSERT INTO MenuTranslation (menu_id, language_id, label) VALUES
(1, 'fr', 'Tableau de bord'),
(1, 'en', 'Dashboard'),
(2, 'fr', 'Rapports'),
(2, 'en', 'Reports');