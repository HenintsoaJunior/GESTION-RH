DROP TABLE IF EXISTS notification_recipients;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS mission_comments;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS mission_report;
DROP TABLE IF EXISTS expense_report_attachments;
DROP TABLE IF EXISTS expense_report;
DROP TABLE IF EXISTS mission_budget;
DROP TABLE IF EXISTS mission_validation;
DROP TABLE IF EXISTS compensation;
DROP TABLE IF EXISTS mission_assignation;
DROP TABLE IF EXISTS compensation_scale;
DROP TABLE IF EXISTS employee_nationalities;
DROP TABLE IF EXISTS user_habilitations;
DROP TABLE IF EXISTS role_habilitation;
DROP TABLE IF EXISTS user_role;
DROP TABLE IF EXISTS categories_of_employee;
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
DROP TABLE IF EXISTS habilitation_groups;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employee_categories;
DROP TABLE IF EXISTS contract_types;
DROP TABLE IF EXISTS genders;
DROP TABLE IF EXISTS nationalities;

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

CREATE TABLE habilitation_groups (
   group_id VARCHAR(50) PRIMARY KEY,
   label VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME
);


CREATE TABLE habilitations (
   habilitation_id VARCHAR(50) PRIMARY KEY,
   group_id VARCHAR(50),
   label VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   FOREIGN KEY (group_id) REFERENCES habilitation_groups(group_id)
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

CREATE TABLE user_habilitations (
  user_id VARCHAR(250),
  habilitation_id VARCHAR(50),
  PRIMARY KEY (user_id, habilitation_id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (habilitation_id) REFERENCES habilitations(habilitation_id)
);

CREATE TABLE employee_nationalities(
   employee_id VARCHAR(50),
   nationality_id VARCHAR(50),
   PRIMARY KEY(employee_id, nationality_id),
   FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
   FOREIGN KEY(nationality_id) REFERENCES nationalities(nationality_id)
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
   mission_type VARCHAR(50) NOT NULL CHECK(mission_type IN('national', 'international')),
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
   is_validated INT DEFAULT 0, 
   type VARCHAR(50) NOT NULL CHECK(type IN('Indemnité', 'Note de frais')),
   allocated_fund DECIMAL(15,2),
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
   PRIMARY KEY(mission_validation_id),
   FOREIGN KEY(to_whom) REFERENCES users(user_id),
   FOREIGN KEY(mission_creator) REFERENCES users(user_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY(mission_assignation_id) REFERENCES mission_assignation(assignation_id)
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

CREATE TABLE mission_comments(
   mission_id VARCHAR(50),
   comment_id VARCHAR(50),
   PRIMARY KEY(mission_id, comment_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY(comment_id) REFERENCES comments(comment_id)
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

CREATE TABLE compensation(
   compensation_id VARCHAR(50),
   transport_amount DECIMAL(15,2),
   breakfast_amount DECIMAL(15,2),
   lunch_amount DECIMAL(15,2),
   dinner_amount DECIMAL(15,2),
   accommodation_amount DECIMAL(15,2),
   status VARCHAR(50) DEFAULT 'not paid',
   payment_date DATETIME,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   assignation_id VARCHAR(50) NOT NULL,
   employee_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(compensation_id),
   FOREIGN KEY(assignation_id) REFERENCES mission_assignation(assignation_id),
   FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
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
   status VARCHAR(50) DEFAULT 'pending',
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   assignation_id VARCHAR(50) NOT NULL,
   expense_report_type_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(expense_report_id),
   FOREIGN KEY(assignation_id) REFERENCES mission_assignation(assignation_id),
   FOREIGN KEY(expense_report_type_id) REFERENCES expense_report_type(expense_report_type_id)
);

CREATE TABLE expense_report_attachments (
   attachment_id VARCHAR(50),
   assignation_id VARCHAR(50) NOT NULL,
   file_name VARCHAR(255) NOT NULL,
   file_content VARBINARY(MAX),
   file_size INT,
   file_type VARCHAR(100),
   uploaded_at DATETIME DEFAULT GETDATE(),
   PRIMARY KEY(attachment_id),
   FOREIGN KEY(assignation_id) REFERENCES mission_assignation(assignation_id) ON DELETE CASCADE
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
   ip_address VARCHAR(50),
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
-- MENU DYNAMIQUE
-- ============================
CREATE TABLE module (
   module_id VARCHAR(50) PRIMARY KEY,
   module_name VARCHAR(100) NOT NULL,
   description VARCHAR(MAX),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE menu (
   menu_id VARCHAR(50) PRIMARY KEY,
   menu_key VARCHAR(50) NOT NULL UNIQUE,
   icon VARCHAR(50),
   link VARCHAR(255),
   is_enabled BIT DEFAULT 1,
   position INT,
   module_id VARCHAR(50),
   section VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (module_id) REFERENCES module(module_id)
);

CREATE TABLE menu_role (
   menu_id VARCHAR(50) NOT NULL,
   role_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (menu_id, role_id),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (role_id) REFERENCES role(role_id)
);

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);


-- ============================
-- NOTIFICATIONS
-- ============================

CREATE TABLE notifications (
   notification_id VARCHAR(50),
   title VARCHAR(255) NOT NULL, 
   message TEXT NOT NULL, 
   type VARCHAR(50) NOT NULL,
   status VARCHAR(50) DEFAULT 'pending',
   related_table VARCHAR(255), 
   related_menu VARCHAR(100),
   related_id VARCHAR(50), 
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   priority INT DEFAULT 1,
   PRIMARY KEY(notification_id)
);

CREATE TABLE notification_recipients (
   notification_id VARCHAR(50),
   user_id VARCHAR(250),
   status VARCHAR(50) DEFAULT 'pending',
   sent_at DATETIME, 
   read_at DATETIME,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(notification_id, user_id),
   FOREIGN KEY(notification_id) REFERENCES notifications(notification_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);