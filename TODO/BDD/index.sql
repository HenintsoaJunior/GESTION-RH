DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS mission_report;
DROP TABLE IF EXISTS expense_report;
DROP TABLE IF EXISTS mission_budget;
DROP TABLE IF EXISTS mission_validation;
DROP TABLE IF EXISTS mission_assignation;
DROP TABLE IF EXISTS compensation_scale;
DROP TABLE IF EXISTS recruitment_request_replacement_reasons;
DROP TABLE IF EXISTS employee_nationalities;
DROP TABLE IF EXISTS recruitment_validation;
DROP TABLE IF EXISTS recruitment_request_details;
DROP TABLE IF EXISTS application_comments;
DROP TABLE IF EXISTS cv_details;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS role_habilitation;
DROP TABLE IF EXISTS user_role;
DROP TABLE IF EXISTS recruitment_request_comments;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS categories_of_employee;
DROP TABLE IF EXISTS job_offers;
DROP TABLE IF EXISTS job_descriptions;
DROP TABLE IF EXISTS recruitment_requests;
DROP TABLE IF EXISTS mission;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS menu_hierarchy;
DROP TABLE IF EXISTS menu_role;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS module;
DROP TABLE IF EXISTS direction;
DROP TABLE IF EXISTS site;
DROP TABLE IF EXISTS lieu;
DROP TABLE IF EXISTS transport;
DROP TABLE IF EXISTS expense_type;
DROP TABLE IF EXISTS expense_report_type;
DROP TABLE IF EXISTS habilitations;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS replacement_reasons;
DROP TABLE IF EXISTS recruitment_reasons;
DROP TABLE IF EXISTS employee_categories;
DROP TABLE IF EXISTS contract_types;
DROP TABLE IF EXISTS genders;
DROP TABLE IF EXISTS nationalities;
DROP TABLE IF EXISTS educations;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS personal_qualities;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS users_simple;



CREATE TABLE direction(
   direction_id VARCHAR(50),
   direction_name VARCHAR(100) NOT NULL,
   acronym VARCHAR(20),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(direction_id)
);

CREATE TABLE department(
   department_id VARCHAR(50),
   department_name VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   direction_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(department_id),
   FOREIGN KEY(direction_id) REFERENCES direction(direction_id)
);

CREATE TABLE service(
   service_id VARCHAR(50),
   service_name VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   department_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(service_id),
   FOREIGN KEY(department_id) REFERENCES department(department_id)
);

CREATE TABLE units(
   unit_id VARCHAR(50),
   unit_name VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   service_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(unit_id),
   FOREIGN KEY(service_id) REFERENCES service(service_id)
);

CREATE TABLE site(
   site_id VARCHAR(50),
   site_name VARCHAR(255) NOT NULL,
   code VARCHAR(10),
   longitude DECIMAL(9,6),
   latitude DECIMAL(9,6),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(site_id)
);

CREATE TABLE nationalities(
   nationality_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   name VARCHAR(100) NOT NULL,
   PRIMARY KEY(nationality_id),
   UNIQUE(code)
);

CREATE TABLE genders(
   gender_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(gender_id),
   UNIQUE(code)
);

CREATE TABLE contract_types(
   contract_type_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(contract_type_id),
   UNIQUE(code)
);

CREATE TABLE employee_categories(
   employee_category_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(employee_category_id),
   UNIQUE(code)
);

CREATE TABLE recruitment_reasons(
   recruitment_reason_id VARCHAR(50),
   name VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(recruitment_reason_id)
);

CREATE TABLE replacement_reasons(
   replacement_reason_id VARCHAR(50),
   name VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(replacement_reason_id)
);

CREATE TABLE candidates(
   candidate_id VARCHAR(50),
   last_name VARCHAR(100) NOT NULL,
   first_name VARCHAR(100) NOT NULL,
   birth_date DATE,
   address VARCHAR(255),
   email VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(candidate_id),
   UNIQUE(email)
);

CREATE TABLE employees(
   employee_id VARCHAR(50),
   employee_code VARCHAR(50),
   last_name VARCHAR(50) NOT NULL,
   first_name VARCHAR(100) NOT NULL,
   phone_number VARCHAR(20) NULL,
   hire_date DATE NOT NULL,
   job_title VARCHAR(100) NULL,
   contract_end_date DATE NULL,
   status VARCHAR(50) DEFAULT 'Actif',
   site_id VARCHAR(50) NOT NULL,
   gender_id VARCHAR(50) NOT NULL,
   contract_type_id VARCHAR(50) NOT NULL,
   direction_id VARCHAR(50) NOT NULL,
   department_id VARCHAR(50),
   service_id VARCHAR(50),
   unit_id VARCHAR(50),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(employee_id),
   UNIQUE(employee_code),
   FOREIGN KEY(site_id) REFERENCES site(site_id),
   FOREIGN KEY(gender_id) REFERENCES genders(gender_id),
   FOREIGN KEY(contract_type_id) REFERENCES contract_types(contract_type_id),
   FOREIGN KEY(direction_id) REFERENCES direction(direction_id),
   FOREIGN KEY(department_id) REFERENCES department(department_id),
   FOREIGN KEY(service_id) REFERENCES service(service_id),
   FOREIGN KEY(unit_id) REFERENCES units(unit_id)
);

CREATE TABLE categories_of_employee(
   employee_id VARCHAR(50),
   employee_category_id VARCHAR(50),
   created_at DATE,
   updated_at DATE,
   PRIMARY KEY(employee_id, employee_category_id),
   FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
   FOREIGN KEY(employee_category_id) REFERENCES employee_categories(employee_category_id)
);

CREATE TABLE role (
    role_id VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(250),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id)
);

CREATE TABLE users (
    user_id VARCHAR(250) NOT NULL,
    matricule VARCHAR(100) UNIQUE,
    email VARCHAR(150) NOT NULL,
    name VARCHAR(250),
    position VARCHAR(250),
    department VARCHAR(100),
    superior_id VARCHAR(150),
    superior_name VARCHAR(150),
    status VARCHAR(50),
    signature VARCHAR(MAX),
    user_type INT,
    refresh_token VARCHAR(MAX),
    refresh_token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

CREATE TABLE user_role (
    user_id VARCHAR(250) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE habilitations(
   habilitation_id VARCHAR(50),
   label VARCHAR(50),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(habilitation_id)
);

CREATE TABLE role_habilitation(
   habilitation_id VARCHAR(50),
   role_id VARCHAR(50),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(habilitation_id, role_id),
   FOREIGN KEY(habilitation_id) REFERENCES habilitations(habilitation_id),
   FOREIGN KEY(role_id) REFERENCES role(role_id)
);



CREATE TABLE recruitment_requests(
   recruitment_request_id VARCHAR(50),
   position_title VARCHAR(255) NOT NULL,
   position_count INT DEFAULT 1,
   contract_duration VARCHAR(100) NULL,
   former_employee_name VARCHAR(255) NULL,
   replacement_date DATE NULL,
   new_position_explanation VARCHAR(250),
   desired_start_date DATE NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   status VARCHAR(10) DEFAULT 'BROUILLON',
   files VARBINARY(250),
   requester_id VARCHAR(250) NOT NULL,
   contract_type_id VARCHAR(50) NOT NULL,
   site_id VARCHAR(50) NOT NULL,
   recruitment_reason_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(recruitment_request_id),
   FOREIGN KEY(requester_id) REFERENCES users(user_id),
   FOREIGN KEY(contract_type_id) REFERENCES contract_types(contract_type_id),
   FOREIGN KEY(site_id) REFERENCES site(site_id),
   FOREIGN KEY(recruitment_reason_id) REFERENCES recruitment_reasons(recruitment_reason_id)
);

CREATE TABLE comments(
   comment_id VARCHAR(50),
   comment_text TEXT,
   user_id VARCHAR(250),
   created_at DATETIME NOT NULL,
   updated_at DATETIME,
   PRIMARY KEY(comment_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE recruitment_request_comments(
   recruitment_request_id VARCHAR(50),
   comment_id VARCHAR(50),
   PRIMARY KEY(recruitment_request_id, comment_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id),
   FOREIGN KEY(comment_id) REFERENCES comments(comment_id)
);

CREATE TABLE recruitment_request_details(
   recruitment_request_detail_id VARCHAR(50),
   supervisor_position VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   recruitment_request_id VARCHAR(50) NOT NULL,
   direction_id VARCHAR(50) NOT NULL,
   department_id VARCHAR(50) NOT NULL,
   service_id VARCHAR(50) NOT NULL,
   direct_supervisor_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(recruitment_request_detail_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id),
   FOREIGN KEY(direction_id) REFERENCES direction(direction_id),
   FOREIGN KEY(department_id) REFERENCES department(department_id),
   FOREIGN KEY(service_id) REFERENCES service(service_id),
   FOREIGN KEY(direct_supervisor_id) REFERENCES employees(employee_id)
);

CREATE TABLE recruitment_validation(
   recruitment_validation_id VARCHAR(50),
   status VARCHAR(50),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   validation_date DATETIME,
   recruitment_creator VARCHAR(250) NOT NULL,
   recruitment_request_id VARCHAR(50) NOT NULL,
   to_whom VARCHAR(250) NOT NULL,
   type VARCHAR(50) NOT NULL,
   PRIMARY KEY(recruitment_validation_id),
   FOREIGN KEY(recruitment_creator) REFERENCES users(user_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id),
   FOREIGN KEY(to_whom) REFERENCES users(user_id)
);

CREATE TABLE job_descriptions(
   description_id VARCHAR(50),
   title VARCHAR(200) NOT NULL,
   description TEXT,
   attributions TEXT,
   required_education VARCHAR(200),
   required_experience TEXT,
   required_personal_qualities TEXT,
   required_skills TEXT,
   required_languages TEXT,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(description_id)
);

CREATE TABLE job_offers(
   offer_id VARCHAR(50),
   status VARCHAR(20),
   publication_date DATETIME,
   deadline_date DATETIME,
   duration INT,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   description_id VARCHAR(50) NOT NULL,
   recruitment_request_id VARCHAR(50) NOT NULL,
   requester_id VARCHAR(250) NOT NULL,
   PRIMARY KEY(offer_id),
   FOREIGN KEY(requester_id) REFERENCES users(user_id),
   FOREIGN KEY(description_id) REFERENCES job_descriptions(description_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id)
);

CREATE TABLE applications(
   application_id VARCHAR(50),
   application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
   cv VARBINARY(250) NOT NULL,
   motivation_letter VARBINARY(250) NOT NULL,
   matching_score SMALLINT,
   status VARCHAR(20) DEFAULT 'SOUMIS' CHECK(status IN('SOUMIS', 'EN_REVUE', 'ACCEPTÉ', 'REJETÉ')),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   offer_id VARCHAR(50),
   candidate_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(application_id),
   FOREIGN KEY(offer_id) REFERENCES job_offers(offer_id),
   FOREIGN KEY(candidate_id) REFERENCES candidates(candidate_id)
);

CREATE TABLE cv_details(
   cv_detail_id VARCHAR(50),
   extracted_skills TEXT,
   extracted_experience TEXT,
   extracted_education TEXT,
   extracted_languages TEXT,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   application_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(cv_detail_id),
   FOREIGN KEY(application_id) REFERENCES applications(application_id)
);


CREATE TABLE application_comments(
   comment_id VARCHAR(50),
   comment_text TEXT,
   created_at DATETIME NOT NULL,
   updated_at DATETIME,
   application_id VARCHAR(50) NOT NULL,
   user_id VARCHAR(250) NOT NULL,
   PRIMARY KEY(comment_id),
   FOREIGN KEY(application_id) REFERENCES applications(application_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE employee_nationalities(
   employee_id VARCHAR(50),
   nationality_id VARCHAR(50),
   PRIMARY KEY(employee_id, nationality_id),
   FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
   FOREIGN KEY(nationality_id) REFERENCES nationalities(nationality_id)
);

CREATE TABLE recruitment_request_replacement_reasons(
   recruitment_request_id VARCHAR(50),
   replacement_reason_id VARCHAR(50),
   description VARCHAR(250),
   PRIMARY KEY(recruitment_request_id, replacement_reason_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id),
   FOREIGN KEY(replacement_reason_id) REFERENCES replacement_reasons(replacement_reason_id)
);


CREATE TABLE expense_type (
   expense_type_id VARCHAR(50),
   type VARCHAR(255),
   time_start TIME,
   time_end TIME,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(expense_type_id)
);

CREATE TABLE transport(
   transport_id VARCHAR(50),
   type VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(transport_id)
);

CREATE TABLE compensation_scale(
   compensation_scale_id VARCHAR(50),
   amount DECIMAL(15,2),
   place VARCHAR(150) DEFAULT 'National', --National, Afrique, Europe, ...
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   transport_id VARCHAR(50),
   expense_type_id VARCHAR(50),
   employee_category_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(compensation_scale_id),
   FOREIGN KEY(transport_id) REFERENCES transport(transport_id),
   FOREIGN KEY(expense_type_id) REFERENCES expense_type(expense_type_id),
   FOREIGN KEY(employee_category_id) REFERENCES employee_categories(employee_category_id)
);

CREATE TABLE lieu (
   lieu_id VARCHAR(50) PRIMARY KEY,
   nom VARCHAR(255) NOT NULL,
   adresse VARCHAR(500),
   ville VARCHAR(255),
   code_postal VARCHAR(20),
   pays VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME
);


CREATE TABLE mission (
   mission_id VARCHAR(50),
   name VARCHAR(255),
   description TEXT,
   start_date DATE,
   end_date DATE,
   status VARCHAR(20) NOT NULL DEFAULT 'En Cours',
   lieu_id VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(mission_id),
   FOREIGN KEY(lieu_id) REFERENCES lieu(lieu_id)
);

CREATE TABLE mission_assignation (
   assignation_id VARCHAR(50),
   departure_date DATE NOT NULL,
   departure_time TIME,
   return_date DATE,
   return_time TIME,
   duration INT,
   is_validated INT DEFAULT 0, -- 0 si non validée, 1 si validée
   type VARCHAR(50) NOT NULL CHECK(type IN('Indemnité', 'Note de frais')),
   allocated_fund DECIMAL(15,2)
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   transport_id VARCHAR(50),
   mission_id VARCHAR(50) NOT NULL,
   employee_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (assignation_id),
   FOREIGN KEY (transport_id) REFERENCES transport(transport_id),
   FOREIGN KEY (mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE mission_validation(
   mission_validation_id VARCHAR(50),
   status VARCHAR(50),
   validation_date DATETIME,
   type VARCHAR(50),
   created_at DATETIME,
   updated_at DATETIME,
   to_whom VARCHAR(250) NOT NULL,
   mission_creator VARCHAR(250) NOT NULL,
   mission_id VARCHAR(50) NOT NULL,
   mission_assignation_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(id_mission_validation),
   FOREIGN KEY(to_whom) REFERENCES users(user_id),
   FOREIGN KEY(mission_creator) REFERENCES users(user_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY(mission_assignation_id) REFERENCES mission_assignation(assignation_id)
);


CREATE TABLE mission_budget(
   mission_budget_id VARCHAR(50),
   direction_name VARCHAR(50),
   budget DECIMAL(15,2),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   user_id VARCHAR(250) NOT NULL,
   PRIMARY KEY(mission_budget_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);


CREATE TABLE expense_report_type(
   expense_report_type_id VARCHAR(50),
   type VARCHAR(250),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(expense_report_type_id)
);

CREATE TABLE expense_report(
   expense_report_id VARCHAR(50),
   titled VARCHAR(250),
   description TEXT,
   type VARCHAR(50) CHECK(type IN('CB', 'ESP')), --carte bancaire ou espèces
   currency_unit VARCHAR(50),
   amount DECIMAL(15,2),
   rate DECIMAL(15,2),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   assignation_id VARCHAR(50) NOT NULL,
   expense_report_type_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(expense_report_id),
   FOREIGN KEY(assignation_id) REFERENCES mission_assignation(assignation_id),
   FOREIGN KEY(expense_report_type_id) REFERENCES expense_report_type(expense_report_type_id)
);

-- compte rendu mission
CREATE TABLE mission_report(
   mission_report_id VARCHAR(50),
   text TEXT,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   user_id VARCHAR(250) NOT NULL,
   assignation_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(mission_report_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id),
   FOREIGN KEY(assignation_id) REFERENCES mission_assignation(assignation_id)
);


CREATE TABLE logs(
   log_id VARCHAR(50),
   action VARCHAR(100) NOT NULL,
   table_name VARCHAR(255),
   old_values TEXT,
   new_values TEXT,
   user_id VARCHAR(250) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(log_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);





-- ============================
-- User Simple
-- ============================


CREATE TABLE users_simple (
    user_id VARCHAR(250) NOT NULL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NULL,
    phone_number VARCHAR(50) NULL,
    password VARCHAR(250) NOT NULL,
    refresh_token VARCHAR(MAX) NULL,
    refresh_token_expiry DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE()
);

-- Table for Education
CREATE TABLE educations (
    education_id VARCHAR(250) NOT NULL PRIMARY KEY,
    utilisateur_id VARCHAR(250) NOT NULL,
    etablissement VARCHAR(250) NOT NULL,
    diplome VARCHAR(250) NOT NULL,
    annee VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES users_simple(user_id) ON DELETE CASCADE
);

-- Table for Experience
CREATE TABLE experiences (
    experience_id VARCHAR(250) NOT NULL PRIMARY KEY,
    utilisateur_id VARCHAR(250) NOT NULL,
    entreprise VARCHAR(250) NOT NULL,
    poste VARCHAR(250) NOT NULL,
    duree VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES users_simple(user_id) ON DELETE CASCADE
);

-- Table for Skills
CREATE TABLE skills (
    skill_id VARCHAR(250) NOT NULL PRIMARY KEY,
    utilisateur_id VARCHAR(250) NOT NULL,
    competence VARCHAR(250) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES users_simple(user_id) ON DELETE CASCADE
);

-- Table for Personal Qualities
CREATE TABLE personal_qualities (
    quality_id VARCHAR(250) NOT NULL PRIMARY KEY,
    utilisateur_id VARCHAR(250) NOT NULL,
    qualite VARCHAR(250) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES users_simple(user_id) ON DELETE CASCADE
);

-- Table for Languages
CREATE TABLE languages (
    language_id VARCHAR(250) NOT NULL PRIMARY KEY,
    utilisateur_id VARCHAR(250) NOT NULL,
    langue VARCHAR(150) NOT NULL,
    niveau VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES users_simple(user_id) ON DELETE CASCADE
);
