-- Suppression des données des tables avec dépendances (ordre inverse de création)
DELETE FROM recruitment_approval;
DELETE FROM employee_nationalities;
DELETE FROM recruitment_request_replacement_reasons;
DELETE FROM recruitment_request_details;
DELETE FROM recruitment_requests;
DELETE FROM users;
DELETE FROM approval_flow;
DELETE FROM employees;
DELETE FROM job_offers;
DELETE FROM job_descriptions;
DELETE FROM units;
DELETE FROM service;
DELETE FROM department;
DELETE FROM direction;
DELETE FROM site;

-- Suppression des données des tables de référence (sans dépendances)
DELETE FROM nationalities;
DELETE FROM marital_statuses;
DELETE FROM genders;
DELETE FROM contract_types;
DELETE FROM employee_categories;
DELETE FROM working_time_types;
DELETE FROM recruitment_reasons;
DELETE FROM replacement_reasons;



INSERT INTO direction (direction_id, direction_name, acronym, created_at, updated_at)
VALUES 
    ('DR_0001', 'Direction Technique', 'DT', GETDATE(), NULL),
    ('DR_0002', 'Direction Commerciale et Marketing', 'DCM', GETDATE(), NULL),
    ('DR_0003', 'Direction Qualité, Risques, Sécurité et Environnement', 'DQRSE', GETDATE(), NULL),
    ('DR_0004', 'Ressources Humaines', 'RH', GETDATE(), NULL),
    ('DR_0005', 'Direction des Systèmes d''Information', 'DSI', GETDATE(), NULL),
    ('DR_0006', 'Direction des Opérations', 'DOP', GETDATE(), NULL),
    ('DR_0007', 'Direction Administrative et Financière', 'DAF', GETDATE(), NULL);


INSERT INTO department (department_id, department_name, direction_id, created_at, updated_at)
VALUES 
    ('DP_0001', 'Bureau d''Études', 'DR_0001', GETDATE(), NULL),
    ('DP_0002', 'Marketing Digital', 'DR_0002', GETDATE(), NULL),
    ('DP_0003', 'Sécurité au Travail', 'DR_0003', GETDATE(), NULL),
    ('DP_0004', 'Recrutement', 'DR_0004', GETDATE(), NULL),
    ('DP_0005', 'Support Informatique', 'DR_0005', GETDATE(), NULL),
    ('DP_0006', 'Logistique', 'DR_0006', GETDATE(), NULL),
    ('DP_0007', 'Comptabilité', 'DR_0007', GETDATE(), NULL);

INSERT INTO service (service_id, service_name, department_id, created_at, updated_at)
VALUES 
    ('SR_0001', 'Conception Technique', 'DP_0001', GETDATE(), NULL),
    ('SR_0002', 'Campagnes Publicitaires', 'DP_0002', GETDATE(), NULL),
    ('SR_0003', 'Contrôle Qualité', 'DP_0003', GETDATE(), NULL),
    ('SR_0004', 'Formation Interne', 'DP_0004', GETDATE(), NULL),
    ('SR_0005', 'Maintenance Réseau', 'DP_0005', GETDATE(), NULL),
    ('SR_0006', 'Gestion des Stocks', 'DP_0006', GETDATE(), NULL),
    ('SR_0007', 'Audit Financier', 'DP_0007', GETDATE(), NULL);


INSERT INTO units (unit_id, unit_name, service_id, created_at, updated_at)
VALUES 
    ('UN_0001', 'Unité de Conception Mécanique', 'SR_0001', CURRENT_TIMESTAMP, NULL),
    ('UN_0002', 'Unité de Publicité Numérique', 'SR_0002', CURRENT_TIMESTAMP, NULL),
    ('UN_0003', 'Unité d''Inspection Qualité', 'SR_0003', CURRENT_TIMESTAMP, NULL);

INSERT INTO site (site_id, site_name, code, longitude, latitude, created_at, updated_at)
VALUES 
    ('ST_0001', 'Antananarivo', 'TNR', NULL, NULL, GETDATE(), NULL),
    ('ST_0002', 'Nosy Be', 'NOS', NULL, NULL, GETDATE(), NULL);


INSERT INTO nationalities (nationality_id, code, name)
VALUES 
    ('NAT_0001', 'MG', 'Malagasy'),
    ('NAT_0002', 'FR', 'Français'),
    ('NAT_0003', 'US', 'Américain');


INSERT INTO marital_statuses (marital_status_id, code, label)
VALUES 
    ('MS_0001', 'CEL', 'Célibataire'),
    ('MS_0002', 'MAR', 'Marié'),
    ('MS_0003', 'DIV', 'Divorcé');


INSERT INTO genders (gender_id, code, label)
VALUES 
    ('GEN_0001', 'M', 'Masculin'),
    ('GEN_0002', 'F', 'Féminin'),
    ('GEN_0003', 'NB', 'Non-binaire');


INSERT INTO contract_types (contract_type_id, code, label)
VALUES 
    ('CT_0001', 'CDI', 'Contrat à Durée Indéterminée'),
    ('CT_0002', 'CDD', 'Contrat à Durée Déterminée'),
    ('CT_0003', 'CTT', 'Contrat de Travail Temporaire');


INSERT INTO employee_categories (employee_category_id, code, label)
VALUES 
    ('EC_0001', 'CAD', 'Cadre'),
    ('EC_0002', 'EMP', 'Employé'),
    ('EC_0003', 'TEC', 'Technicien');


INSERT INTO working_time_types (working_time_type_id, code, label)
VALUES 
    ('WTT_0001', 'TP', 'Temps plein'),
    ('WTT_0002', 'TPT', 'Temps partiel'),
    ('WTT_0003', 'MT', 'Mi-temps');


INSERT INTO recruitment_reasons (recruitment_reason_id, name, created_at, updated_at)
VALUES 
    ('RR_0001', 'Remplacement d''un employé', CURRENT_TIMESTAMP, NULL),
    ('RR_0002', 'Création d''un nouveau poste', CURRENT_TIMESTAMP, NULL),
    ('RR_0003', 'Dotation prévue au budget', CURRENT_TIMESTAMP, NULL);


INSERT INTO replacement_reasons (replacement_reason_id, name, created_at, updated_at)
VALUES 
    ('RPR_0001', 'Décès', CURRENT_TIMESTAMP, NULL),
    ('RPR_0002', 'Démission', CURRENT_TIMESTAMP, NULL),
    ('RPR_0003', 'Essai non-concluant', CURRENT_TIMESTAMP, NULL),
    ('RPR_0004', 'Retraite', CURRENT_TIMESTAMP, NULL),
    ('RPR_0005', 'Licenciement', CURRENT_TIMESTAMP, NULL),
    ('RPR_0006', 'Rupture de contrat à l’amiable', CURRENT_TIMESTAMP, NULL),
    ('RPR_0007', 'Mobilité interne', CURRENT_TIMESTAMP, NULL);


-- INSERT INTO recruitment_request_replacement_reasons (recruitment_reason_id, replacement_reason_id, description)
-- VALUES 
--     ('RR_0001', 'RPR_0002', 'Démission de M. Rakoto pour poursuivre des études à l''étranger.'),
--     ('RR_0001', 'RPR_0004', 'Retraite anticipée de Mme Rabe après 30 ans de service.'),
--     ('RR_0001', 'RPR_0007', 'Congé de maternité de Mme Andriana, prévu pour 6 mois.');

INSERT INTO employees (
    employee_id, employee_code, last_name, first_name, birth_date, birth_place, children_count,
    cin_number, cin_date, cin_place, cnaPS_number, address, address_complement,
    bank_code, branch_code, account_number, rib_key, hire_date, job_title, grade,
    is_executive, contract_end_date, departure_date, departure_reason_code, departure_reason_title,
    headcount, birth_date_, status, created_at, updated_at,
    unit_id, service_id, department_id, direction_id,
    working_time_type_id, employee_category_id, contract_type_id,
    gender_id, marital_status_id, site_id
)
VALUES
    ('EMP_0001', 'EC_0001', 'Dupont', 'Jean', '1985-03-15', 'Antananarivo', 2,
     'CIN123456789', '2010-06-20', 'Antananarivo', 'CNAPS987654321', 'Lot 123, Analakely', NULL,
     'BOA001', '12345', '12345678901234567890', '01', '2023-01-10', 'Développeur Full Stack', 'Senior',
     0, '2025-01-09', NULL, NULL, NULL,
     1, NULL, 'Actif', SYSUTCDATETIME(), NULL,
     'UN_0001', 'SR_0001', 'DP_0001', 'DR_0001',
     'WTT_0001', 'EC_0003', 'CT_0002',
     'GEN_0001', 'MS_0002', 'ST_0001'),
    ('EMP_0002', 'EC_0002', 'Rakoto', 'Marie', '1990-07-22', 'Nosy Be', 0,
     'CIN987654321', '2015-09-10', 'Nosy Be', 'CNAPS123456789', 'Lot 456, Hell-Ville', 'Apt 12',
     'BFV002', '67890', '98765432109876543210', '02', '2024-03-01', 'Analyste Financier', 'Junior',
     0, NULL, NULL, NULL, NULL,
     1, NULL, 'Actif', SYSUTCDATETIME(), NULL,
     'UN_0003', 'SR_0007', 'DP_0007', 'DR_0007',
     'WTT_0001', 'EC_0002', 'CT_0001',
     'GEN_0002', 'MS_0001', 'ST_0002'),
    ('EMP_0003', 'EC_0003', 'Lefèvre', 'Sophie', '1978-11-30', 'Antananarivo', 3,
     'CIN456789123', '2000-12-15', 'Antananarivo', 'CNAPS456123789', 'Lot 789, Ankadivato', NULL,
     'SGM003', '54321', '45678912345678912345', '03', '2022-06-15', 'Responsable RH', 'Manager',
     1, NULL, '2025-04-30', 'RPR_0004', 'Retraite',
     1, NULL, 'Inactif', SYSUTCDATETIME(), NULL,
     'UN_0002', 'SR_0004', 'DP_0004', 'DR_0004',
     'WTT_0001', 'EC_0001', 'CT_0001',
     'GEN_0002', 'MS_0002', 'ST_0001'),
    ('EMP_0004', 'EC_0004', 'Bernard', 'Luc', '1995-04-12', 'Tamatave', 1,
     'CIN789123456', '2018-03-25', 'Tamatave', 'CNAPS789456123', 'Lot 101, Ambatomanga', NULL,
     'BOA004', '98765', '78912345678912345678', '04', '2024-01-20', 'Technicien de Maintenance', 'Technicien',
     0, '2024-07-19', NULL, NULL, NULL,
     1, NULL, 'Actif', SYSUTCDATETIME(), NULL,
     'UN_0001', 'SR_0005', 'DP_0005', 'DR_0005',
     'WTT_0002', 'EC_0003', 'CT_0002',
     'GEN_0001', 'MS_0003', 'ST_0001'),
    ('EMP_0005', 'EC_0005', 'Rabe', 'Andriana', '1988-09-05', 'Antananarivo', 2,
     'CIN321654987', '2012-11-11', 'Antananarivo', 'CNAPS321654987', 'Lot 202, Ivandry', NULL,
     'BFV005', '11223', '32165498732165498732', '05', '2023-09-01', 'Assistant Commercial', 'Assistant',
     0, '2024-03-31', NULL, NULL, NULL,
     1, NULL, 'Actif', SYSUTCDATETIME(), NULL,
     'UN_0002', 'SR_0002', 'DP_0002', 'DR_0002',
     'WTT_0003', 'EC_0002', 'CT_0003',
     'GEN_0002', 'MS_0002', 'ST_0001');

INSERT INTO users (
    user_id, email, password, role, created_at, updated_at, function_, employee_id
)
VALUES
    ('USR_0001', 'jean.dupont@company.com', '1234', 'Employee', CURRENT_TIMESTAMP, NULL, 'Développeur Full Stack', 'EMP_0001'),
    ('USR_0002', 'marie.rakoto@company.com', '1234', 'Employee', CURRENT_TIMESTAMP, NULL, 'Analyste Financier', 'EMP_0002'),
    ('USR_0003', 'sophie.lefevre@company.com', '1234', 'Manager', CURRENT_TIMESTAMP, NULL, 'Responsable RH', 'EMP_0003'),
    ('USR_0004', 'luc.bernard@company.com', '1234', 'Employee', CURRENT_TIMESTAMP, NULL, 'Technicien de Maintenance', 'EMP_0004'),
    ('USR_0005', 'andriana.rabe@company.com', '1234', 'Employee', CURRENT_TIMESTAMP, NULL, 'Assistant Commercial', 'EMP_0005');

INSERT INTO recruitment_requests (
    recruitment_request_id, position_title, position_count, contract_duration, 
    former_employee_name, replacement_date, new_position_explanation, 
    desired_start_date, created_at, updated_at, status, files, 
    requester_id, recruitment_reason_id, site_id, contract_type_id
)
VALUES 
    ('RRQ_0001', 'Développeur Full Stack', 2, '12 mois', 'Jean Dupont', '2025-06-01', NULL, '2025-08-01', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0001', 'RR_0001', 'ST_0001', 'CT_0001'),
    ('RRQ_0002', 'Analyste Financier', 1, 'CDI', NULL, NULL, 'Nouveau poste pour expansion', '2025-09-01', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0002', 'RR_0001', 'ST_0002', 'CT_0002'),
    ('RRQ_0003', 'Technicien de Maintenance', 3, '6 mois', 'Marie Lefèvre', '2025-05-15', NULL, '2025-07-15', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0004', 'RR_0001', 'ST_0001', 'CT_0003'),
    ('RRQ_0004', 'Responsable RH', 1, 'CDI', 'Luc Martin', '2025-04-30', NULL, '2025-06-30', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0003', 'RR_0001', 'ST_0001', 'CT_0002'),
    ('RRQ_0005', 'Assistant Commercial', 2, '3 mois', NULL, NULL, 'Projet temporaire', '2025-07-01', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0005', 'RR_0001', 'ST_0001', 'CT_0003'),
    ('RRQ_0006', 'Chef de Projet', 1, '18 mois', 'Sophie Bernard', '2025-06-10', NULL, '2025-08-15', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0003', 'RR_0001', 'ST_0002', 'CT_0001'),
    ('RRQ_0007', 'Agent de Sécurité', 4, 'CDD 6 mois', NULL, NULL, 'Renforcement équipe', '2025-07-10', CURRENT_TIMESTAMP, NULL, 'BROUILLON', NULL, 'USR_0003', 'RR_0001', 'ST_0002', 'CT_0003');

INSERT INTO recruitment_request_details (
    recruitment_request_detail_id, supervisor_position, created_at, updated_at,
    direct_supervisor_id, service_id, department_id, direction_id, recruitment_request_id
)
VALUES
    ('RRD_0001', 'Lead Développeur', CURRENT_TIMESTAMP, NULL, 'EMP_0001', 'SR_0001', 'DP_0001', 'DR_0001', 'RRQ_0001'),
    ('RRD_0002', 'Manager Financier', CURRENT_TIMESTAMP, NULL, 'EMP_0002', 'SR_0007', 'DP_0007', 'DR_0007', 'RRQ_0002'),
    ('RRD_0003', 'Chef d''Équipe Maintenance', CURRENT_TIMESTAMP, NULL, 'EMP_0004', 'SR_0005', 'DP_0005', 'DR_0005', 'RRQ_0003'),
    ('RRD_0004', 'Directeur RH', CURRENT_TIMESTAMP, NULL, 'EMP_0003', 'SR_0004', 'DP_0004', 'DR_0004', 'RRQ_0004'),
    ('RRD_0005', 'Responsable Commercial', CURRENT_TIMESTAMP, NULL, 'EMP_0005', 'SR_0002', 'DP_0002', 'DR_0002', 'RRQ_0005'),
    ('RRD_0006', 'Manager de Projet', CURRENT_TIMESTAMP, NULL, 'EMP_0001', 'SR_0001', 'DP_0001', 'DR_0001', 'RRQ_0006'),
    ('RRD_0007', 'Superviseur Sécurité', CURRENT_TIMESTAMP, NULL, 'EMP_0004', 'SR_0003', 'DP_0003', 'DR_0003', 'RRQ_0007');

INSERT INTO approval_flow (
    approval_flow_id, approval_order, approver_role, created_at, updated_at, approver_id
)
VALUES
    ('AF_0001', 1, 'Superviseur Direct', CURRENT_TIMESTAMP, NULL, 'EMP_0005'),
    ('AF_0002', 2, 'Manager DSI', CURRENT_TIMESTAMP, NULL, 'EMP_0004'),
    ('AF_0003', 1, 'Manager Financier', CURRENT_TIMESTAMP, NULL, 'EMP_0002'),
    ('AF_0004', 2, 'Directeur DAF', CURRENT_TIMESTAMP, NULL, 'EMP_0002'),
    ('AF_0005', 1, 'Chef d''Équipe', CURRENT_TIMESTAMP, NULL, 'EMP_0004'),
    ('AF_0006', 2, 'Manager DSI', CURRENT_TIMESTAMP, NULL, 'EMP_0004'),
    ('AF_0007', 1, 'Directeur RH', CURRENT_TIMESTAMP, NULL, 'EMP_0003'),
    ('AF_0008', 1, 'Responsable Commercial', CURRENT_TIMESTAMP, NULL, 'EMP_0005'),
    ('AF_0009', 2, 'Manager DCM', CURRENT_TIMESTAMP, NULL, 'EMP_0005'),
    ('AF_0010', 1, 'Superviseur Projet', CURRENT_TIMESTAMP, NULL, 'EMP_0005'),
    ('AF_0011', 2, 'Manager DSI', CURRENT_TIMESTAMP, NULL, 'EMP_0004'),
    ('AF_0012', 1, 'Superviseur Sécurité', CURRENT_TIMESTAMP, NULL, 'EMP_0004'),
    ('AF_0013', 2, 'Manager DQRSE', CURRENT_TIMESTAMP, NULL, 'EMP_0004');

INSERT INTO employee_nationalities (
    employee_id, nationality_id
)
VALUES
    ('EMP_0001', 'NAT_0001'),
    ('EMP_0001', 'NAT_0002'),
    ('EMP_0002', 'NAT_0001'),
    ('EMP_0003', 'NAT_0002'),
    ('EMP_0004', 'NAT_0001'),
    ('EMP_0005', 'NAT_0001');

INSERT INTO recruitment_approval (
    recruitment_request_id, approver_id, approval_flow_id, status, approval_order,
    approval_date, comment, signature, created_at, updated_at
)
VALUES
    ('RRQ_0001', 'USR_0001', 'AF_0002', 'Approuvé', 2, '2025-07-12', 'Budget validé', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0002', 'USR_0002', 'AF_0003', 'En attente', 1, NULL, 'En revue financière', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0002', 'USR_0003', 'AF_0004', 'En attente', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0003', 'USR_0004', 'AF_0005', 'Approuvé', 1, '2025-07-11', 'Remplacement urgent', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0003', 'USR_0003', 'AF_0006', 'Approuvé', 2, '2025-07-12', 'Validé par DSI', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0004', 'USR_0003', 'AF_0007', 'En attente', 1, NULL, 'En attente de validation RH', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0005', 'USR_0005', 'AF_0008', 'Approuvé', 1, '2025-07-11', 'Projet temporaire approuvé', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0005', 'USR_0003', 'AF_0009', 'Approuvé', 2, '2025-07-12', 'Budget marketing validé', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0006', 'USR_0003', 'AF_0010', 'En attente', 1, NULL, 'En revue par superviseur', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0006', 'USR_0003', 'AF_0011', 'En attente', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0007', 'USR_0003', 'AF_0012', 'Approuvé', 1, '2025-07-11', 'Renforcement sécurité validé', NULL, CURRENT_TIMESTAMP, NULL),
    ('RRQ_0007', 'USR_0003', 'AF_0013', 'Approuvé', 2, '2025-07-12', 'Conforme aux normes DQRSE', NULL, CURRENT_TIMESTAMP, NULL);