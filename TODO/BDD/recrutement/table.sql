   -- Tokony alaina any amin'ny basen'ny société : département, type de contrat, utilisateurs, employés, budget, etc.

   -- Drop tables if they exist
-- Suppression des tables dans le bon ordre pour respecter les clés étrangères
   DROP TABLE IF EXISTS recruitment_notifications;
   DROP TABLE IF EXISTS recruitment_request_files;
   DROP TABLE IF EXISTS recruitment_approval;
   DROP TABLE IF EXISTS recruitment_request;
   DROP TABLE IF EXISTS approval_flow;
   DROP TABLE IF EXISTS application_comments;
   DROP TABLE IF EXISTS action_logs;
   DROP TABLE IF EXISTS cv_details;
   DROP TABLE IF EXISTS applications;
   DROP TABLE IF EXISTS job_offers;
   DROP TABLE IF EXISTS job_descriptions;
   DROP TABLE IF EXISTS users;
   DROP TABLE IF EXISTS action_type;
   DROP TABLE IF EXISTS candidates;
   DROP TABLE IF EXISTS contract_types;
   DROP TABLE IF EXISTS departments;

   -- Module 1 : Suivi du recrutement

   -- Table pour les départements
   CREATE TABLE departments(
      department_id VARCHAR(50),
      department_name VARCHAR(100) NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      PRIMARY KEY(department_id)
   );

   -- Table pour les types de contrat
   CREATE TABLE contract_types(
      contract_type_id VARCHAR(50),
      contract_type_name VARCHAR(50) NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      PRIMARY KEY(contract_type_id)
   );

   -- Table pour les candidats
   CREATE TABLE candidates(
      candidate_id VARCHAR(50),
      last_name VARCHAR(100) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      birth_date DATE,
      address VARCHAR(255),
      email VARCHAR(100) NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      PRIMARY KEY(candidate_id),
      UNIQUE(email)
   );

   -- Table pour les types d'actions (pour la journalisation)
   CREATE TABLE action_type(
      action_type_id VARCHAR(50),
      type VARCHAR(50) NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      PRIMARY KEY(action_type_id)
   );

   -- Table pour les utilisateurs RH/Managers
   CREATE TABLE users(
      user_id VARCHAR(50),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      department_id VARCHAR(50) NOT NULL,
      PRIMARY KEY(user_id),
      FOREIGN KEY(department_id) REFERENCES departments(department_id)
   );

   -- Table pour les fiches de poste
   CREATE TABLE job_descriptions (
      description_id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      location VARCHAR(100),
      description VARCHAR(MAX),
      required_skills VARCHAR(MAX),
      required_experience VARCHAR(MAX),
      required_education VARCHAR(200),
      required_languages VARCHAR(200),
      contract_type_id VARCHAR(50),
      department_id VARCHAR(50),
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      FOREIGN KEY(contract_type_id) REFERENCES contract_types(contract_type_id),
      FOREIGN KEY(department_id) REFERENCES departments(department_id)
   );

   -- Table pour les offres d'emploi
   CREATE TABLE job_offers (
      offer_id VARCHAR(50) PRIMARY KEY,
      description_id VARCHAR(50),
      status VARCHAR(20) DEFAULT 'Publié', -- BROUILLON, PUBLIÉ, FERMÉ
      publication_date DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      deadline_date DATETIME2,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      FOREIGN KEY(description_id) REFERENCES job_descriptions(description_id)
   );



   -- Table pour les candidatures
   CREATE TABLE applications(
      application_id VARCHAR(50),
      application_date DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      cv VARBINARY(50) NOT NULL,
      motivation_letter VARBINARY(50) NOT NULL,
      matching_score SMALLINT,
      status VARCHAR(20) DEFAULT 'Reçue', --CHECK(status IN('SOUMIS', 'EN_REVUE', 'ACCEPTÉ', 'REJETÉ')),
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      candidate_id VARCHAR(50),
      offer_id VARCHAR(50),
      PRIMARY KEY(application_id),
      FOREIGN KEY(candidate_id) REFERENCES candidates(candidate_id),
      FOREIGN KEY(offer_id) REFERENCES job_offers(offer_id)
   );

   -- Table pour stocker les informations extraites des CV
   CREATE TABLE cv_details(
      cv_detail_id VARCHAR(50),
      extracted_skills VARCHAR(MAX),
      extracted_experience VARCHAR(MAX),
      extracted_education VARCHAR(MAX),
      extracted_languages VARCHAR(MAX),
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      application_id VARCHAR(50),
      PRIMARY KEY(cv_detail_id),
      FOREIGN KEY(application_id) REFERENCES applications(application_id)
   );

   -- Table pour journaliser les actions (sécurité et conformité RGPD)
   CREATE TABLE action_logs(
      log_id VARCHAR(50),
      entity_type VARCHAR(50) NOT NULL,
      action_description VARCHAR(MAX),
      action_at DATETIME2 NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      user_id VARCHAR(50),
      action_type_id VARCHAR(50),
      PRIMARY KEY(log_id),
      FOREIGN KEY(user_id) REFERENCES users(user_id),
      FOREIGN KEY(action_type_id) REFERENCES action_type(action_type_id)
   );

   -- Table pour les commentaires RH sur les candidatures
   CREATE TABLE application_comments(
      comment_id VARCHAR(50),
      comment_text VARCHAR(MAX),
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      application_id VARCHAR(50),
      user_id VARCHAR(50),
      PRIMARY KEY(comment_id),
      FOREIGN KEY(application_id) REFERENCES applications(application_id),
      FOREIGN KEY(user_id) REFERENCES users(user_id)
   );

   -- Table pour l'ordre des approbateurs
   CREATE TABLE approval_flow(
      approval_flow_id VARCHAR(50),
      approval_order INT NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      department_id VARCHAR(50) NOT NULL,
      PRIMARY KEY(approval_flow_id),
      FOREIGN KEY(department_id) REFERENCES departments(department_id)
   );

   -- Table pour les demandes de recrutement
   CREATE TABLE recruitment_request(
      recruitment_request_id VARCHAR(50),
      job_title VARCHAR(100) NOT NULL,
      description VARCHAR(MAX),
      request_date DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'En attente', --CHECK(status IN('EN_ATTENTE', 'APPROUVÉ', 'REJETÉ', 'ANNULÉ')),
      approval_date DATETIME2 NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      requester_id VARCHAR(50) NOT NULL,
      PRIMARY KEY(recruitment_request_id),
      FOREIGN KEY(requester_id) REFERENCES users(user_id)
   );

   -- Table pour les fichiers reliés à une demande de validation de recrutement
   CREATE TABLE recruitment_request_files(
      file_id VARCHAR(50),
      files VARBINARY(MAX) NOT NULL,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      recruitment_request_id VARCHAR(50) NOT NULL,
      PRIMARY KEY(file_id),
      FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_request(recruitment_request_id)
   );                                        

   -- Table pour l'approbation des demandes
   CREATE TABLE recruitment_approval(
      approver_id VARCHAR(50),
      recruitment_request_id VARCHAR(50),
      status VARCHAR(50),
      approval_order INT,
      approval_date DATETIME2,
      comment VARCHAR(MAX),
      signature VARBINARY(MAX),
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      PRIMARY KEY(approver_id, recruitment_request_id),
      FOREIGN KEY(approver_id) REFERENCES departments(department_id),
      FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_request(recruitment_request_id)
   );

   -- Table pour les notifications
   CREATE TABLE recruitment_notifications(
      recruitment_notification_id VARCHAR(50),
      message VARCHAR(50),
      date_message DATETIME2,
      created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME2,
      recruitment_request_id VARCHAR(50) NOT NULL,
      PRIMARY KEY(recruitment_notification_id),
      FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_request(recruitment_request_id)
   );



























