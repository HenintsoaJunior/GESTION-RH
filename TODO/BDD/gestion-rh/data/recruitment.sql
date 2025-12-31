INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('recrutement', 'Recrutement', 'Gestion des recrutements', GETDATE(), GETDATE());


-- MENUS DE RECRUTEMENT
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at, is_visible) VALUES
('menu3', 'recrutement', 'fa-user-tie', '/recrutement', 1, 3, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1),
('menu3_1', 'Demandes', 'fa-layer-group', '/recrutement/demandes/liste', 1, 4, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1),
('menu3_2', 'Validation des demandes', 'fa-tasks', '/recrutement/demandes/validation', 1, 5, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1),
('menu3_3', 'Statistiques', 'fa-reg-chart-bar', '/recrutement/statistiques', 1, 6, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1);

INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h_recrutement', NULL, 'menu3', GETDATE(), GETDATE()),
('h_rec_liste_demande', 'menu3', 'menu3_1', GETDATE(), GETDATE()),
('h_rec_val', 'menu3', 'menu3_2', GETDATE(), GETDATE()),
('h_rec_stats', 'menu3', 'menu3_3', GETDATE(), GETDATE());


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
('HAB_032', 'HABG_004', 'Créer demande recrutement', 'Permet de créer une demande de recrutement'),
('HAB_033', 'HABG_004', 'Annuler demande recrutement', 'Permet d’annuler une demande de recrutement'),
('HAB_034', 'HABG_004', 'Afficher détails demande recrutement', 'Permet de voir les détails d’une demande de recrutement'),
('HAB_035', 'HABG_004', 'Créer fiche de poste', 'Permet de créer une fiche de poste'),
('HAB_036', 'HABG_004', 'Modifier fiche de poste', 'Permet de modifier une fiche de poste'),
('HAB_037', 'HABG_004', 'Afficher fiche de poste', 'Permet d’afficher la fiche de poste spécifiée'),
('HAB_038', 'HABG_004', 'Supprimer fiche de poste', 'Permet de supprimer une fiche de poste'),
('HAB_039', 'HABG_004', 'Exporter PDF demande recrutement', 'Permet d’éxporter en PDF une demande de recrutement'),
('HAB_040', 'HABG_004', 'Exporter PDF fiche de poste', 'Permet d’éxporter en PDF une fiche de poste');

INSERT INTO replacement_reasons (replacement_reason_id, reason_name) VALUES
('RR_001', 'Décès'),
('RR_002', 'Démission'),
('RR_003', 'Essai non concluant'),
('RR_004', 'Retraite'),
('RR_005', 'Licenciement'),
('RR_006', 'Rupture de contrat à l’amiable'),
('RR_007', 'Mobilité interne');


INSERT INTO level_educations (level_education_id, level_education_name) VALUES
('NIV_ETU_0001', '6ème'),
('NIV_ETU_0002', '5ème'),
('NIV_ETU_0003', '4ème'),
('NIV_ETU_0004', '3ème'),
('NIV_ETU_0005', 'Seconde'),
('NIV_ETU_0006', 'Première'),
('NIV_ETU_0007', 'Terminale'),
('NIV_ETU_0008', 'Bac +1'),
('NIV_ETU_0009', 'Bac +2'),
('NIV_ETU_0010', 'Bac +3'),
('NIV_ETU_0011', 'Bac +4'),
('NIV_ETU_0012', 'Bac +5'),
('NIV_ETU_0013', 'Bac +6'),
('NIV_ETU_0014', 'Bac +7'),
('NIV_ETU_0015', 'Bac +8');


