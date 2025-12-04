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


-- -- CONTRATS
-- INSERT INTO contract_types (contract_type_id, code, label) VALUES
-- ('CTR_001', 'CDD', 'Contrat à Durée Déterminée'),
-- ('CTR_002', 'CDI', 'Contrat à Durée Indéterminée'),
-- ('CTR_003', 'Stage', 'Stage'),
-- ('CTR_004', 'VIE', 'Volontariat International en Entreprise');


-- STATUTS DE DEMANDE
INSERT INTO requests_status (status_id, status_name) VALUES
('STD_001', 'Brouillon'),
('STD_002', 'En cours'),
('STD_003', 'Validée'),
('STD_004', 'Refusée');

-- STATUTS DE FICHE
INSERT INTO job_descriptions_status (status_id, status_name) VALUES
('STF_001', 'Brouillon'),
('STF_002', 'En cours'),
('STF_003', 'Publiée');


-- HABILITATIONS ET GROUPES
INSERT INTO habilitation_groups (group_id, label) VALUES
('HABG_004', 'Gestion des Recrutements');

INSERT INTO habilitations (habilitation_id, group_id, label, description) VALUES
('HAB_031', 'HABG_004', 'Lister demandes recrutement', 'Permet de voir la liste des demandes de recrutement'),
('HAB_032', 'HABG_004', 'Créer demande recrutement', 'Permet de cré demande de recrutement'),
('HAB_033', 'HABG_004', 'Annuler demande recrutement', 'Permet d’annuler une demande de recrutement');

INSERT INTO replacement_reasons (replacement_reason_id, reason_name) VALUES
('RR_001', 'Décès'),
('RR_002', 'Démission'),
('RR_003', 'Essai non concluant'),
('RR_004', 'Retraite'),
('RR_005', 'Licenciement'),
('RR_006', 'Rupture de contrat à l’amiable'),
('RR_007', 'Mobilité interne');
