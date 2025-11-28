INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('recrutement', 'Recrutement', 'Gestion des recrutements', GETDATE(), GETDATE());


-- MENUS DE RECRUTEMENT
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at) VALUES
('menu3', 'recrutement', 'fa-user-tie', '/recrutement', 1, 3, 'recrutement', 'navigation', GETDATE(), GETDATE()),
('menu3_1', 'Demandes', 'fa-layer-group', '/recrutement/demandes/liste', 1, 4, 'recrutement', 'navigation', GETDATE(), GETDATE()),
('menu3_2', 'Validation des demandes', 'fa-tasks', '/recrutement/demandes/validation', 1, 5, 'recrutement', 'navigation', GETDATE(), GETDATE()),
('menu3_3', 'Statistiques', 'fa-reg-chart-bar', '/recrutement/statistiques', 1, 6, 'recrutement', 'navigation', GETDATE(), GETDATE());

INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h_recrutement', NULL, 'menu3', GETDATE(), GETDATE()),
('h_rec_liste_demande', 'menu3', 'menu3_1', GETDATE(), GETDATE()),
('h_rec_val', 'menu3', 'menu3_2', GETDATE(), GETDATE()),
('h_rec_stats', 'menu3', 'menu3_3', GETDATE(), GETDATE());


-- CONTRATS
INSERT INTO contract_types (contract_type_id, code, label) VALUES
('CTR_001', 'CDD', 'Contrat à Durée Déterminée'),
('CTR_002', 'CDI', 'Contrat à Durée Indéterminée'),
('CTR_003', 'Stage', 'Stage'),
('CTR_004', 'VIE', 'Volontariat International en Entreprise');


-- STATUTS DE DEMANDE
INSERT INTO requests_status (status_id, status_name) VALUES
('STT/DMD-001', 'Brouillon'),
('STT/DMD-002', 'En cours'),
('STT/DMD-003', 'Validée'),
('STT/DMD-004', 'Refusée');

-- STATUTS DE FICHE
INSERT INTO job_descriptions_status (status_id, status_name) VALUES
('STT/FCP-001', 'Brouillon'),
('STT/FCP-002', 'En cours'),
('STT/FCP-003', 'Publiée');
