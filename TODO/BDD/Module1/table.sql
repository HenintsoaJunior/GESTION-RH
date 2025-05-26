
-- Table pour les départements
CREATE TABLE departments(
   department_id VARCHAR(50),
   department_name VARCHAR(100)  NOT NULL,
   PRIMARY KEY(department_id)
);


-- Table pour les types de contrat
CREATE TABLE contract_types(
   contract_type_id VARCHAR(50),),
   contract_type_name VARCHAR(50)  NOT NULL,
   PRIMARY KEY(contract_type_id)
);

-- Table pour les candidats
CREATE TABLE candidates(
   candidate_id VARCHAR(50),
   last_name VARCHAR(100)  NOT NULL,
   first_name VARCHAR(100)  NOT NULL,
   birth_date DATE,
   address VARCHAR(255) ,
   email VARCHAR(100)  NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(candidate_id),
   UNIQUE(email)
);

-- Table pour les types d'actions (pour la journalisation) (Create, Update, ... Delete, etc.)
CREATE TABLE action_type(
   action_type_id VARCHAR(50) ,
   type VARCHAR(50)  NOT NULL,
   PRIMARY KEY(action_type_id)
);

-- Table pour les utilisateurs RH/Managers
CREATE TABLE users(
   user_id VARCHAR(50) ,
   name VARCHAR(255) ,
   email VARCHAR(100)  NOT NULL,
   password VARCHAR(255)  NOT NULL,
   role VARCHAR(50)  NOT NULL,
   department_id INT NOT NULL,
   PRIMARY KEY(user_id),
   FOREIGN KEY(department_id) REFERENCES departments(department_id)
);

-- Table pour les offres d'emploi
CREATE TABLE job_offers(
   offer_id VARCHAR(50),
   title VARCHAR(200)  NOT NULL,
   location VARCHAR(100) ,
   deadline_date DATETIME2,
   description VARCHAR(max),
   required_skills VARCHAR(max),
   required_experience VARCHAR(max),
   required_education VARCHAR(200) ,
   required_languages VARCHAR(200) ,
   status ENUM('DRAFT', 'PUBLISHED', 'CLOSED') DEFAULT 'DRAFT',
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   department_id INT,
   contract_type_id INT,
   PRIMARY KEY(offer_id),
   FOREIGN KEY(department_id) REFERENCES departments(department_id),
   FOREIGN KEY(contract_type_id) REFERENCES contract_types(contract_type_id)
);

-- Table pour les candidatures
CREATE TABLE applications(
   application_id VARCHAR(50),,
   application_date DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   cv VARBINARY(50)  NOT NULL,
   motivation_letter VARBINARY(50)  NOT NULL,
   matching_score SMALLINT,
   status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED') DEFAULT 'SUBMITTED',
   offer_id INT,
   candidate_id INT,
   PRIMARY KEY(application_id),
   FOREIGN KEY(offer_id) REFERENCES job_offers(offer_id),
   FOREIGN KEY(candidate_id) REFERENCES candidates(candidate_id)
);

-- Table pour stocker les informations extraites des CV
CREATE TABLE cv_details(
   cv_detail_id VARCHAR(50),
   extracted_skills VARCHAR(max),
   extracted_experience VARCHAR(max),
   extracted_education VARCHAR(max),
   extracted_languages VARCHAR(max),
   application_id INT,
   PRIMARY KEY(cv_detail_id),
   FOREIGN KEY(application_id) REFERENCES applications(application_id)
);


-- Table pour journaliser les actions (sécurité et conformité RGPD)
CREATE TABLE action_logs(
   log_id VARCHAR(50) ,
   entity_type VARCHAR(50)  NOT NULL,
   action_description VARCHAR(max),
   action_at DATETIME2 NOT NULL,
   action_type_id VARCHAR(50) ,
   user_id VARCHAR(50) ,
   PRIMARY KEY(log_id),
   FOREIGN KEY(action_type_id) REFERENCES action_type(action_type_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);


-- Table pour les commentaires RH sur les candidatures
CREATE TABLE application_comments(
   comment_id VARCHAR(50) ,
   comment_text VARCHAR(max),
   created_at DATETIME2 NOT NULL,
   user_id VARCHAR(50) ,
   application_id INT,
   PRIMARY KEY(comment_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id),
   FOREIGN KEY(application_id) REFERENCES applications(application_id)
);
