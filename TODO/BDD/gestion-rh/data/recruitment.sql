INSERT INTO module (module_id, module_name, description, created_at, updated_at) VALUES
('recrutement', 'Recrutement', 'Gestion des recrutements', GETDATE(), GETDATE());


-- MENUS DE RECRUTEMENT
INSERT INTO menu (menu_id, menu_key, icon, link, is_enabled, position, module_id, section, created_at, updated_at, is_visible) VALUES
('menu3', 'recrutement', 'fa-user-tie', '/recrutement', 1, 3, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1),
('menu3_1', 'Demandes', 'fa-layer-group', '/recrutement/demandes/liste', 1, 4, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1),
('menu3_2', 'Validations', 'fa-tasks', '/recrutement/demandes/validation', 1, 5, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1),
('menu3_3', 'Statistiques', 'fa-reg-chart-bar', '/recrutement/statistiques', 1, 6, 'recrutement', 'navigation', GETDATE(), GETDATE(), 1);

INSERT INTO menu_hierarchy (hierarchy_id, parent_menu_id, menu_id, created_at, updated_at) VALUES
('h_recrutement', NULL, 'menu3', GETDATE(), GETDATE()),
('h_rec_liste_demande', 'menu3', 'menu3_1', GETDATE(), GETDATE()),
('h_rec_val', 'menu3', 'menu3_2', GETDATE(), GETDATE()),
('h_rec_stats', 'menu3', 'menu3_3', GETDATE(), GETDATE());


-- STATUTS DE DEMANDE
INSERT INTO requests_status (status_id, status_name) VALUES
('STD_001', 'En attente'),
('STD_002', 'En cours'),
('STD_003', 'Validée'),
('STD_004', 'Refusée');

-- STATUTS DE FICHE
INSERT INTO job_descriptions_status (status_id, status_name) VALUES
('STF_001', 'En attente'),
('STF_002', 'Validée'),
('STF_003', 'Publiée');


-- HABILITATIONS ET GROUPES
INSERT INTO habilitation_groups (group_id, label) VALUES
('HABG_004', 'Suivi de Recrutement');

INSERT INTO habilitations (habilitation_id, group_id, label, description) VALUES
('HAB_031', 'HABG_004', 'Lister demandes recrutement', 'Permet de voir la liste des demandes de recrutement'),
('HAB_032', 'HABG_004', 'Créer demande recrutement', 'Permet de créer une demande de recrutement'),
('HAB_033', 'HABG_004', 'Créer demande régularisation', 'Permet de créer une demande de régularisation'),
('HAB_034', 'HABG_004', 'Exporter PDF demande recrutement', 'Permet d’éxporter en PDF une demande de recrutement'),
('HAB_035', 'HABG_004', 'Créer TDR', 'Permet de créer un TDR'),
('HAB_036', 'HABG_004', 'Modifier TDR', 'Permet de modifier un TDR'),
('HAB_037', 'HABG_004', 'Supprimer TDR', 'Permet de supprimer un TDR'),
('HAB_038', 'HABG_004', 'Exporter PDF TDR', 'Permet d’éxporter en PDF un TDR'),
('HAB_039', 'HABG_004', 'Afficher TDR', 'Permet d’afficher le TDR'),
('HAB_040', 'HABG_004', 'Lister demandes N-1', 'Permet d’afficher les demandes de recrutement de la direction'),
('HAB_041', 'HABG_004', 'Valider TDR', 'Permet de valider et de publier un TDR');

INSERT INTO replacement_reasons (replacement_reason_id, reason_name) VALUES
('RR_001', 'Démission'),
('RR_002', 'Décès'),
('RR_003', 'Essai non concluant'),
('RR_004', 'Retraite'),
('RR_005', 'Licenciement'),
('RR_006', 'Rupture de contrat à l’amiable'),
('RR_007', 'Mobilité interne');

INSERT INTO soft_skills (soft_skill_id, soft_skill_name) VALUES
('SS_0001', 'Communication'),
('SS_0002', 'Travail en équipe'),
('SS_0003', 'Réactivité'),
('SS_0004', 'Adaptabilité'),
('SS_0005', 'Fléxibilité'),
('SS_0006', 'Leadership'),
('SS_0007', 'Créativité'),
('SS_0008', 'Sérieux'),
('SS_0009', 'Esprit critique'),
('SS_0010', 'Persévérance'),
('SS_0011', 'Organisation'),
('SS_0012', 'Autonomie');


INSERT INTO level_educations (level_education_id, level_education_name) VALUES
('NIV_ETU_0001', 'Seconde'),
('NIV_ETU_0002', 'Première'),
('NIV_ETU_0003', 'Terminale'),
('NIV_ETU_0004', 'Bac +1'),
('NIV_ETU_0005', 'Bac +2'),
('NIV_ETU_0006', 'Bac +3'),
('NIV_ETU_0007', 'Bac +4'),
('NIV_ETU_0008', 'Bac +5'),
('NIV_ETU_0009', 'Bac +6'),
('NIV_ETU_0010', 'Bac +7'),
('NIV_ETU_0011', 'Bac +8');


INSERT INTO posts_types (post_type_id, post_type_name) VALUES
('TYP_POS-0001', 'Poste à responsabilité'),
('TYP_POS-0002', 'Poste technique');
    

INSERT INTO role_habilitation (habilitation_id, role_id) VALUES
('HAB_031', 'ROLE_001'),
('HAB_032', 'ROLE_001'),
('HAB_033', 'ROLE_001'),
('HAB_034', 'ROLE_001'),
('HAB_035', 'ROLE_001'),
('HAB_036', 'ROLE_001'),
('HAB_037', 'ROLE_001'),
('HAB_038', 'ROLE_001'),
('HAB_039', 'ROLE_001'),
('HAB_031', 'ROLE_004'),
('HAB_032', 'ROLE_004'),
('HAB_033', 'ROLE_004'),
('HAB_034', 'ROLE_004'),
('HAB_035', 'ROLE_004'),
('HAB_036', 'ROLE_004'),
('HAB_037', 'ROLE_004'),
('HAB_038', 'ROLE_004'),
('HAB_039', 'ROLE_004'),
('HAB_041', 'ROLE_004'),
('HAB_032', 'ROLE_002'),
('HAB_033', 'ROLE_002'),
('HAB_034', 'ROLE_002'),
('HAB_035', 'ROLE_002'),
('HAB_036', 'ROLE_002'),
('HAB_038', 'ROLE_002'),
('HAB_039', 'ROLE_002'),
('HAB_032', 'ROLE_003'),
('HAB_034', 'ROLE_003'),
('HAB_035', 'ROLE_003'),
('HAB_036', 'ROLE_003'),
('HAB_038', 'ROLE_003'),
('HAB_039', 'ROLE_003'),
('HAB_031', 'ROLE_005');
