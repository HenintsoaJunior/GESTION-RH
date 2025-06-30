-- Module 1 : Suivi du recrutement

-- Suppression des données dans les tables filles avant les tables parentes
DELETE FROM recruitment_notifications;
DELETE FROM recruitment_request_files;
DELETE FROM recruitment_approval;
DELETE FROM recruitment_request;
DELETE FROM approval_flow;
DELETE FROM application_comments;
DELETE FROM action_logs;
DELETE FROM cv_details;
DELETE FROM applications;
DELETE FROM job_offers;
DELETE FROM job_descriptions;
DELETE FROM users;
DELETE FROM action_type;
DELETE FROM candidates;
DELETE FROM contract_types;
DELETE FROM departments;

INSERT INTO departments (department_id, department_name) VALUES
('DEP001', 'Ressources Humaines'),
('DEP002', 'Informatique'),
('DEP003', 'Marketing'),
('DEP004', 'Finance');

INSERT INTO contract_types (contract_type_id, contract_type_name) VALUES
('CT001', 'CDI'),
('CT002', 'CDD'),
('CT003', 'Stage');

INSERT INTO action_type (action_type_id, type) VALUES
('ACT001', 'Création'),
('ACT002', 'Modification'),
('ACT003', 'Suppression'),
('ACT004', 'Archivage');

INSERT INTO users (user_id, first_name, last_name, email, password, role, department_id) VALUES
('USR001', 'Claire', 'Dubois', 'claire.dubois@entreprise.fr', CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', 'motdepasse123' + 'sel_unique_1'), 2), 'RH', 'DEP001'),
('USR002', 'Marc', 'Leroy', 'marc.leroy@entreprise.fr', CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', 'password456' + 'sel_unique_2'), 2), 'Manager', 'DEP002'),
('USR003', 'Sophie', 'Bernard', 'sophie.bernard@entreprise.fr', CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', 'azerty789' + 'sel_unique_3'), 2), 'Manager', 'DEP003'),
('USR004', 'Julien', 'Moreau', 'julien.moreau@entreprise.fr', CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', '123motdepasse' + 'sel_unique_4'), 2), 'RH', 'DEP001');

INSERT INTO approval_flow (approval_flow_id, approval_order, department_id)
VALUES 
('AF001', 1, 'DEP004'),
('AF002', 2, 'DEP003'),
('AF003', 3, 'DEP001');


INSERT INTO candidates (candidate_id, last_name, first_name, birth_date, address, email) VALUES
('CAND001', 'Rakoto', 'Jean', '1995-03-12', 'Lot 12 A, Antananarivo', 'jean.rakoto@mail.com'),
('CAND002', 'Rasoanaivo', 'Lova', '1998-07-22', 'Lot 101 B, Fianarantsoa', 'lova.rasoanaivo@mail.com'),
('CAND003', 'Randriamahefa', 'Hery', '1992-05-15', 'Ambositra centre', 'hery.randriamahefa@mail.com'),
('CAND004', 'Andriamanisa', 'Sitraka', '1990-09-10', 'Toamasina', 'sitraka.andriamanisa@mail.com'),
('CAND005', 'Razanamahery', 'Fanja', '1994-11-30', 'Antsirabe', 'fanja.razanamahery@mail.com'),
('CAND006', 'Andriantsalama', 'Tiana', '1996-06-14', 'Faravohitra', 'tiana.andriantsalama@mail.com'),
('CAND007', 'Raherilalao', 'Niry', '1993-12-01', 'Ambatondrazaka', 'niry.raherilalao@mail.com'),
('CAND008', 'Ramanandraibe', 'Joel', '1991-04-08', 'Ivandry', 'joel.ramanandraibe@mail.com'),
('CAND009', 'Randrianarivelo', 'Mickael', '1997-01-21', 'Mahajanga', 'mickael.randrianarivelo@mail.com'),
('CAND010', 'Rakotomanga', 'Hanitra', '1999-10-05', 'Antsiranana', 'hanitra.rakotomanga@mail.com');

INSERT INTO job_descriptions (
  description_id, title, location, description, required_skills, required_experience,
  required_education, required_languages, contract_type_id, department_id
) VALUES
('JD001', 'Développeur Web', 'Antananarivo', 'Développement d’applications web internes.', 'HTML, CSS, JavaScript', '2 ans', 'Licence', 'Français', 'CT001', 'DEP002'),
('JD002', 'Chargé de Communication', 'Fianarantsoa', 'Mise en place des campagnes marketing.', 'Rédaction, Photoshop', '1 an', 'Master', 'Français, Anglais', 'CT002', 'DEP003'),
('JD003', 'Comptable', 'Antsirabe', 'Tenue de la comptabilité générale.', 'Sage, Excel', '3 ans', 'BTS', 'Français', 'CT001', 'DEP004'),
('JD004', 'Assistant RH', 'Toamasina', 'Gestion administrative du personnel.', 'Pack Office, Communication', '1 an', 'Licence', 'Français', 'CT003', 'DEP001'),
('JD005', 'Data Analyst', 'Antananarivo', 'Analyse de données pour la prise de décision.', 'SQL, Power BI', '2 ans', 'Master', 'Français, Anglais', 'CT001', 'DEP002'),
('JD006', 'Community Manager', 'Mahajanga', 'Animation des réseaux sociaux.', 'Facebook, Instagram, Canva', '1 an', 'Licence', 'Français', 'CT002', 'DEP003'),
('JD007', 'Chef de Projet', 'Antsiranana', 'Pilotage de projets transverses.', 'Gestion de projet, Leadership', '5 ans', 'Master', 'Français, Anglais', 'CT001', 'DEP002'),
('JD008', 'Stagiaire Finance', 'Toliara', 'Assistance sur les opérations comptables.', 'Excel, Analyse financière', '0 an', 'Licence', 'Français', 'CT003', 'DEP004'),
('JD009', 'UX/UI Designer', 'Antananarivo', 'Conception d’interfaces utilisateurs.', 'Figma, Adobe XD', '2 ans', 'Licence', 'Français, Anglais', 'CT002', 'DEP002'),
('JD010', 'Responsable Marketing', 'Toamasina', 'Stratégie marketing globale.', 'SEO, Google Ads', '4 ans', 'Master', 'Français', 'CT001', 'DEP003');

INSERT INTO job_offers (
  offer_id, description_id, status, publication_date, deadline_date
) VALUES
('OFF001', 'JD001', 'Publié', '2025-06-25', '2025-07-31'),
('OFF002', 'JD002', 'Publié', '2025-06-25', '2025-07-25'),
('OFF003', 'JD003', 'Publié', '2025-06-26', '2025-08-10'),
('OFF004', 'JD004', 'Publié', '2025-06-26', '2025-08-01'),
('OFF005', 'JD005', 'Publié', '2025-06-27', '2025-07-28'),
('OFF006', 'JD006', 'Publié', '2025-06-27', '2025-07-20'),
('OFF007', 'JD007', 'Publié', '2025-06-28', '2025-08-15'),
('OFF008', 'JD008', 'Publié', '2025-06-28', '2025-07-18'),
('OFF009', 'JD009', 'Publié', '2025-06-29', '2025-08-05'),
('OFF010', 'JD010', 'Publié', '2025-06-29', '2025-08-12');


INSERT INTO applications (application_id, application_date, cv, motivation_letter, matching_score, status, candidate_id, offer_id) VALUES
('APP001', '2025-06-01', 0x1234, 0x5678, 85, 'Reçue', 'CAND001', 'OFF001'),
('APP002', '2025-06-02', 0x1234, 0x5678, 78, 'Reçue', 'CAND002', 'OFF002'),
('APP003', '2025-06-03', 0x1234, 0x5678, 92, 'Reçue', 'CAND003', 'OFF003'),
('APP004', '2025-06-04', 0x1234, 0x5678, 70, 'Reçue', 'CAND004', 'OFF004'),
('APP005', '2025-06-05', 0x1234, 0x5678, 88, 'Reçue', 'CAND005', 'OFF005'),
('APP006', '2025-06-06', 0x1234, 0x5678, 73, 'Reçue', 'CAND006', 'OFF006'),
('APP007', '2025-06-07', 0x1234, 0x5678, 80, 'Reçue', 'CAND007', 'OFF007'),
('APP008', '2025-06-08', 0x1234, 0x5678, 90, 'Reçue', 'CAND008', 'OFF008'),
('APP009', '2025-06-09', 0x1234, 0x5678, 75, 'Reçue', 'CAND009', 'OFF009'),
('APP010', '2025-06-10', 0x1234, 0x5678, 82, 'Reçue', 'CAND010', 'OFF010');

INSERT INTO cv_details (cv_detail_id, extracted_skills, extracted_experience, extracted_education, extracted_languages, application_id) VALUES
('CV001', 'HTML, CSS', '2 ans chez ABC', 'Licence Informatique', 'Français', 'APP001'),
('CV002', 'Photoshop, Rédaction', '1 an chez ComDigit', 'Master Communication', 'Français, Anglais', 'APP002'),
('CV003', 'Sage, Excel', '3 ans chez Fiduciaire', 'BTS Comptabilité', 'Français', 'APP003'),
('CV004', 'Pack Office', '1 an en RH', 'Licence RH', 'Français', 'APP004'),
('CV005', 'SQL, Power BI', '2 ans chez DataCorp', 'Master Statistiques', 'Français, Anglais', 'APP005'),
('CV006', 'Canva, Réseaux sociaux', '1 an chez SocialWeb', 'Licence Marketing', 'Français', 'APP006'),
('CV007', 'Gestion de projet', '5 ans chez ProDev', 'Master Management', 'Français, Anglais', 'APP007'),
('CV008', 'Excel, Finance', 'Stage chez BankX', 'Licence Finance', 'Français', 'APP008'),
('CV009', 'Figma, UX', '2 ans chez UIStudio', 'Licence Design', 'Français, Anglais', 'APP009'),
('CV010', 'SEO, Google Ads', '4 ans chez MarketLab', 'Master Marketing', 'Français', 'APP010');

INSERT INTO recruitment_request (recruitment_request_id, job_title, description, request_date, status, requester_id) VALUES
('RR001', 'Développeur Web', 'Besoin urgent pour projet ERP', '2025-06-15', 'En attente', 'USR002'),
('RR002', 'Chargé de Communication', 'Renforcer l’équipe marketing digital', '2025-06-16', 'En attente', 'USR003'),
('RR003', 'Comptable Senior', 'Remplacement suite à un départ', '2025-06-17', 'En attente', 'USR004'),
('RR004', 'Assistant RH', 'Augmentation du volume de recrutement', '2025-06-18', 'En attente', 'USR001'),
('RR005', 'Data Analyst', 'Suivi KPI métier', '2025-06-19', 'En attente', 'USR002'),
('RR006', 'Community Manager', 'Gérer communauté réseaux sociaux', '2025-06-20', 'En attente', 'USR003'),
('RR007', 'Chef de Projet', 'Ouverture nouveau chantier', '2025-06-21', 'En attente', 'USR002'),
('RR008', 'Stagiaire Finance', 'Support traitement factures', '2025-06-22', 'En attente', 'USR004'),
('RR009', 'UX/UI Designer', 'Modernisation plateforme interne', '2025-06-23', 'En attente', 'USR002'),
('RR010', 'Responsable Marketing', 'Départ en congé maternité', '2025-06-24', 'En attente', 'USR003');

INSERT INTO recruitment_request_files (file_id, files, recruitment_request_id) VALUES
('FILE001', 0xDEADBEEF, 'RR001'),
('FILE002', 0xDEADBEEF, 'RR002'),
('FILE003', 0xDEADBEEF, 'RR003'),
('FILE004', 0xDEADBEEF, 'RR004'),
('FILE005', 0xDEADBEEF, 'RR005'),
('FILE006', 0xDEADBEEF, 'RR006'),
('FILE007', 0xDEADBEEF, 'RR007'),
('FILE008', 0xDEADBEEF, 'RR008'),
('FILE009', 0xDEADBEEF, 'RR009'),
('FILE010', 0xDEADBEEF, 'RR010');

INSERT INTO recruitment_approval (approver_id, recruitment_request_id, status, approval_order, comment, signature) VALUES
('DEP004', 'RR001', 'En attente', 1, 'À valider', 0xCAFEBABE),
('DEP003', 'RR002', 'En attente', 2, 'En cours d’analyse', 0xCAFEBABE),
('DEP001', 'RR003', 'En attente', 3, 'Demande à vérifier', 0xCAFEBABE),
('DEP004', 'RR004', 'En attente', 1, 'Voir fiche de poste', 0xCAFEBABE),
('DEP003', 'RR005', 'En attente', 2, 'OK sous conditions', 0xCAFEBABE),
('DEP001', 'RR006', 'En attente', 3, 'À discuter', 0xCAFEBABE),
('DEP004', 'RR007', 'En attente', 1, 'Budget à valider', 0xCAFEBABE),
('DEP003', 'RR008', 'En attente', 2, 'Prioritaire', 0xCAFEBABE),
('DEP001', 'RR009', 'En attente', 3, 'En cours RH', 0xCAFEBABE),
('DEP004', 'RR010', 'En attente', 1, 'Poste critique', 0xCAFEBABE);

INSERT INTO recruitment_notifications (recruitment_notification_id, message, date_message, recruitment_request_id) VALUES
('NTF001', 'Nouvelle demande reçue', '2025-06-15', 'RR001'),
('NTF002', 'Demande en cours d’approbation', '2025-06-16', 'RR002'),
('NTF003', 'Demande rejetée', '2025-06-17', 'RR003'),
('NTF004', 'Demande validée', '2025-06-18', 'RR004'),
('NTF005', 'Demande annulée', '2025-06-19', 'RR005'),
('NTF006', 'Rappel pour approbation', '2025-06-20', 'RR006'),
('NTF007', 'Nouveau commentaire ajouté', '2025-06-21', 'RR007'),
('NTF008', 'Demande expédiée au DG', '2025-06-22', 'RR008'),
('NTF009', 'Entretien programmé', '2025-06-23', 'RR009'),
('NTF010', 'Signature en attente', '2025-06-24', 'RR010');

INSERT INTO application_comments (comment_id, comment_text, application_id, user_id) VALUES
('COM001', 'Très bon profil', 'APP001', 'USR001'),
('COM002', 'Manque d’expérience', 'APP002', 'USR002'),
('COM003', 'Formation adéquate', 'APP003', 'USR003'),
('COM004', 'À revoir après entretien', 'APP004', 'USR004'),
('COM005', 'Profil intéressant', 'APP005', 'USR001'),
('COM006', 'Recommandé par RH', 'APP006', 'USR002'),
('COM007', 'Stage uniquement', 'APP007', 'USR003'),
('COM008', 'Non retenu', 'APP008', 'USR004'),
('COM009', 'À valider avec manager', 'APP009', 'USR001'),
('COM010', 'Convocation à envoyer', 'APP010', 'USR002');

INSERT INTO action_logs (log_id, entity_type, action_description, action_at, user_id, action_type_id) VALUES
('LOG001', 'application', 'Ajout candidature', '2025-06-01', 'USR001', 'ACT001'),
('LOG002', 'job_offer', 'Mise à jour offre', '2025-06-02', 'USR002', 'ACT002'),
('LOG003', 'candidate', 'Suppression profil', '2025-06-03', 'USR003', 'ACT003'),
('LOG004', 'recruitment_request', 'Demande archivée', '2025-06-04', 'USR004', 'ACT004'),
('LOG005', 'cv_detail', 'Extraction CV', '2025-06-05', 'USR001', 'ACT001'),
('LOG006', 'application', 'Note modifiée', '2025-06-06', 'USR002', 'ACT002'),
('LOG007', 'job_offer', 'Offre supprimée', '2025-06-07', 'USR003', 'ACT003'),
('LOG008', 'candidate', 'Archivé automatiquement', '2025-06-08', 'USR004', 'ACT004'),
('LOG009', 'application', 'Validation manager', '2025-06-09', 'USR001', 'ACT002'),
('LOG010', 'recruitment_approval', 'Ajout signature', '2025-06-10', 'USR002', 'ACT001');


