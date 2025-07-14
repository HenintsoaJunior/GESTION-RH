   -- Tokony alaina any amin'ny basen'ny société : département, type de contrat, utilisateurs, employés, budget, etc.

   -- Drop tables if they exist
-- Suppression des tables dans le bon ordre pour respecter les clés étrangères
DROP TABLE IF EXISTS recruitment_approval;
DROP TABLE IF EXISTS application_comments;
DROP TABLE IF EXISTS cv_details;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS job_offers;
DROP TABLE IF EXISTS recruitment_request_files;
DROP TABLE IF EXISTS recruitment_notifications;
DROP TABLE IF EXISTS recruitment_request;
DROP TABLE IF EXISTS action_logs;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS action_type;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS job_descriptions;
DROP TABLE IF EXISTS contract_types;
DROP TABLE IF EXISTS approval_flow;
DROP TABLE IF EXISTS direction;
DROP TABLE IF EXISTS site;

   -- Module 1 : Suivi du recrutement
-- Table direction
CREATE TABLE direction (
   direction_id VARCHAR(50),
   direction_name VARCHAR(100) NOT NULL,
   acronym VARCHAR(10),
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY (direction_id)
);

-- Table ordre de l'approuveur
CREATE TABLE approval_flow (
   approval_flow_id VARCHAR(50),
   approval_order INT NOT NULL CHECK (approval_order >= 0), -- Ajout CHECK pour ordre positif
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   direction_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (approval_flow_id),
   FOREIGN KEY (direction_id) REFERENCES direction(direction_id)
);

-- Table type de contrat
CREATE TABLE contract_types (
   contract_type_id VARCHAR(50),
   contract_type_name VARCHAR(50) NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY (contract_type_id)
);

-- Table fiche de poste
CREATE TABLE job_descriptions (
   description_id VARCHAR(50),
   title VARCHAR(200) NOT NULL,
   description VARCHAR(MAX),
   required_skills VARCHAR(MAX),
   required_experience VARCHAR(MAX),
   required_education VARCHAR(200),
   required_languages VARCHAR(200),
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   direction_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour cohérence
   PRIMARY KEY (description_id),
   FOREIGN KEY (direction_id) REFERENCES direction(direction_id)
);
CREATE INDEX idx_job_descriptions_direction_id ON job_descriptions(direction_id); -- Index pour optimiser les jointures

-- Table candidats
CREATE TABLE candidates (
   candidate_id VARCHAR(50),
   last_name VARCHAR(100) NOT NULL,
   first_name VARCHAR(100) NOT NULL,
   birth_date DATE,
   address VARCHAR(255),
   email VARCHAR(100) NOT NULL, --CHECK (email LIKE '%@%.%'), -- Ajout CHECK pour format email
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY (candidate_id),
   UNIQUE (email)
);

-- Table type d'action
CREATE TABLE action_type (
   action_type_id VARCHAR(50),
   type VARCHAR(50) NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY (action_type_id)
);

-- Table utilisateurs
CREATE TABLE users (
   user_id VARCHAR(50),
   first_name VARCHAR(255),
   last_name VARCHAR(255),
   email VARCHAR(100) NOT NULL, --CHECK (email LIKE '%@%.%'), -- Ajout CHECK pour format email
   password VARCHAR(255) NOT NULL, -- Doit être haché (ex. bcrypt)
   role VARCHAR(50) NOT NULL, --CHECK (role IN ('ADMIN', 'MANAGER', 'RECRUITER', 'USER')), -- Contrainte CHECK sur role
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   function_ VARCHAR(50) NOT NULL,
   direction_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (user_id),
   FOREIGN KEY (direction_id) REFERENCES direction(direction_id)
);
CREATE INDEX idx_users_direction_id ON users(direction_id); -- Index pour optimiser les jointures

-- Table department
CREATE TABLE department (
   department_id VARCHAR(50),
   department_name VARCHAR(255) NOT NULL,
   created_at DATETIME2,
   updated_at DATETIME2,
   direction_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (department_id),
   FOREIGN KEY (direction_id) REFERENCES direction(direction_id)
);
CREATE INDEX idx_department_direction_id ON department(direction_id); -- Index pour optimiser les jointures

-- Table service
CREATE TABLE service (
   service_id VARCHAR(50),
   service_name VARCHAR(255) NOT NULL,
   created_at DATETIME2,
   updated_at DATETIME2,
   department_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (service_id),
   FOREIGN KEY (department_id) REFERENCES department(department_id)
);
CREATE INDEX idx_service_department_id ON service(department_id); -- Index pour optimiser les jointures

-- Table lieu
CREATE TABLE site (
   site_id VARCHAR(50),
   site_name VARCHAR(255) NOT NULL,
   code VARCHAR(10),
   longitude DECIMAL(9,6),
   latitude DECIMAL(9,6),
   created_at DATETIME2,
   updated_at DATETIME2,
   PRIMARY KEY (site_id)
);

-- Table historique des actions
CREATE TABLE action_logs (
   log_id VARCHAR(50),
   entity_type VARCHAR(50) NOT NULL,
   action_description VARCHAR(MAX),
   action_at DATETIME2 NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   user_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour traçabilité
   action_type_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour cohérence
   PRIMARY KEY (log_id),
   FOREIGN KEY (user_id) REFERENCES users(user_id),
   FOREIGN KEY (action_type_id) REFERENCES action_type(action_type_id)
);
CREATE INDEX idx_action_logs_user_id ON action_logs(user_id); -- Index pour optimiser les jointures
CREATE INDEX idx_action_logs_action_type_id ON action_logs(action_type_id); -- Index pour optimiser les jointures

-- Table demande de recrutement
CREATE TABLE recruitment_request (
   recruitment_request_id VARCHAR(50),
   quantity INT CHECK (quantity > 0), -- Ajout CHECK pour quantité positive
   job_title VARCHAR(100) NOT NULL,
   description VARCHAR(MAX),
   reason_of_recruitment VARCHAR(50),
   date_of_occurence DATE,
   former_holder VARCHAR(500),
   is_planned_in_the_budget BIT NOT NULL DEFAULT 0, -- Rendu NOT NULL avec défaut
   explanation_if_not_in_the_budget VARCHAR(MAX),
   desired_date DATE,
   duration INT CHECK (duration > 0), -- Ajout CHECK pour durée positive
   request_date DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Remplacement CURRENT_DATE par CURRENT_TIMESTAMP pour cohérence
   status VARCHAR(20) NOT NULL DEFAULT 'En attente', --CHECK (status IN ('EN_ATTENTE', 'APPROUVÉ', 'REJETÉ', 'ANNULÉ')),
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   site_id VARCHAR(50) NOT NULL,
   contract_type_id VARCHAR(50) NOT NULL,
   requester_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (recruitment_request_id),
   FOREIGN KEY (site_id) REFERENCES site(site_id),
   FOREIGN KEY (contract_type_id) REFERENCES contract_types(contract_type_id),
   FOREIGN KEY (requester_id) REFERENCES users(user_id)
);
CREATE INDEX idx_recruitment_request_site_id ON recruitment_request(site_id); -- Index pour optimiser les jointures
CREATE INDEX idx_recruitment_request_contract_type_id ON recruitment_request(contract_type_id); -- Index pour optimiser les jointures
CREATE INDEX idx_recruitment_request_requester_id ON recruitment_request(requester_id); -- Index pour optimiser les jointures

-- Table notifications pour les demandes
CREATE TABLE recruitment_notifications (
   recruitment_notification_id VARCHAR(50),
   message VARCHAR(50),
   date_message DATETIME2,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   recruitment_request_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (recruitment_notification_id),
   FOREIGN KEY (recruitment_request_id) REFERENCES recruitment_request(recruitment_request_id)
);
CREATE INDEX idx_recruitment_notifications_request_id ON recruitment_notifications(recruitment_request_id); -- Index pour optimiser les jointures

-- Table fichiers pour les demandes de recrutement
CREATE TABLE recruitment_request_files (
   file_id VARCHAR(50),
   files VARBINARY(MAX) NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   recruitment_request_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (file_id),
   FOREIGN KEY (recruitment_request_id) REFERENCES recruitment_request(recruitment_request_id)
);
CREATE INDEX idx_recruitment_request_files_request_id ON recruitment_request_files(recruitment_request_id); -- Index pour optimiser les jointures

-- Table offre d'emploi
CREATE TABLE job_offers (
   offer_id VARCHAR(50),
   status VARCHAR(20) NOT NULL,  --CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED')), -- Ajout CHECK pour status
   publication_date DATETIME2,
   deadline_date DATETIME2,
   duration INT CHECK (duration > 0), -- Ajout CHECK pour durée positive
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP, -- Ajout DEFAULT pour cohérence
   updated_at DATETIME2,
   contract_type_id VARCHAR(50) NOT NULL,
   site_id VARCHAR(50) NOT NULL,
   description_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (offer_id),
   FOREIGN KEY (contract_type_id) REFERENCES contract_types(contract_type_id),
   FOREIGN KEY (site_id) REFERENCES site(site_id),
   FOREIGN KEY (description_id) REFERENCES job_descriptions(description_id)
);
CREATE INDEX idx_job_offers_contract_type_id ON job_offers(contract_type_id); -- Index pour optimiser les jointures
CREATE INDEX idx_job_offers_site_id ON job_offers(site_id); -- Index pour optimiser les jointures
CREATE INDEX idx_job_offers_description_id ON job_offers(description_id); -- Index pour optimiser les jointures

-- Table candidatures
CREATE TABLE applications (
   application_id VARCHAR(50),
   application_date DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   cv VARBINARY(MAX) NOT NULL,
   motivation_letter VARBINARY(MAX) NOT NULL,
   matching_score SMALLINT CHECK (matching_score BETWEEN 0 AND 100), -- Ajout CHECK pour score
   status VARCHAR(20) NOT NULL DEFAULT 'SOUMIS' , --CHECK (status IN ('SOUMIS', 'EN_REVUE', 'ACCEPTÉ', 'REJETÉ')),
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   candidate_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour cohérence
   offer_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour cohérence
   PRIMARY KEY (application_id),
   FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
   FOREIGN KEY (offer_id) REFERENCES job_offers(offer_id)
);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id); -- Index pour optimiser les jointures
CREATE INDEX idx_applications_offer_id ON applications(offer_id); -- Index pour optimiser les jointures

-- Table details des cv
CREATE TABLE cv_details (
   cv_detail_id VARCHAR(50),
   extracted_skills VARCHAR(MAX),
   extracted_experience VARCHAR(MAX),
   extracted_education VARCHAR(MAX),
   extracted_languages VARCHAR(MAX),
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   application_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour cohérence
   PRIMARY KEY (cv_detail_id),
   FOREIGN KEY (application_id) REFERENCES applications(application_id)
);
CREATE INDEX idx_cv_details_application_id ON cv_details(application_id); -- Index pour optimiser les jointures

-- Table commentaires sur les candidatures
CREATE TABLE application_comments (
   comment_id VARCHAR(50),
   comment_text VARCHAR(MAX),
   created_at DATETIME2 NOT NULL,
   updated_at DATETIME2,
   application_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour cohérence
   user_id VARCHAR(50) NOT NULL, -- Rendu NOT NULL pour traçabilité
   PRIMARY KEY (comment_id),
   FOREIGN KEY (application_id) REFERENCES applications(application_id),
   FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE INDEX idx_application_comments_application_id ON application_comments(application_id); -- Index pour optimiser les jointures
CREATE INDEX idx_application_comments_user_id ON application_comments(user_id); -- Index pour optimiser les jointures

-- Table validation des demandes de recrutement
CREATE TABLE recruitment_approval (
   direction_id VARCHAR(50),
   recruitment_request_id VARCHAR(50),
   status VARCHAR(50) NOT NULL, -- CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')), -- Ajout CHECK pour status
   approval_order INT CHECK (approval_order >= 0), -- Ajout CHECK pour ordre positif
   approval_date DATETIME2,
   comment VARCHAR(MAX),
   signature VARBINARY(MAX),
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY (direction_id, recruitment_request_id),
   FOREIGN KEY (direction_id) REFERENCES direction(direction_id),
   FOREIGN KEY (recruitment_request_id) REFERENCES recruitment_request(recruitment_request_id)
);
CREATE INDEX idx_recruitment_approval_request_id ON recruitment_approval(recruitment_request_id); -- Index pour optimiser les jointures



























