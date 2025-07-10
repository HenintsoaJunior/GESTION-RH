-- Dropping tables in reverse order to handle foreign key constraints
DROP TABLE IF EXISTS recruitment_approval;
DROP TABLE IF EXISTS employee_nationalities;
DROP TABLE IF EXISTS approval_flow;
DROP TABLE IF EXISTS recruitment_request_details;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS recruitment_requests;
DROP TABLE IF EXISTS recruitment_request_replacement_reasons;
DROP TABLE IF EXISTS replacement_reasons;
DROP TABLE IF EXISTS recruitment_reasons;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS working_time_types;
DROP TABLE IF EXISTS employee_categories;
DROP TABLE IF EXISTS contract_types;
DROP TABLE IF EXISTS genders;
DROP TABLE IF EXISTS marital_statuses;
DROP TABLE IF EXISTS nationalities;
DROP TABLE IF EXISTS site;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS direction;

-- Creating tables
CREATE TABLE direction(
   direction_id VARCHAR(50) ,
   direction_name VARCHAR(100)  NOT NULL,
   acronym VARCHAR(20) ,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY(direction_id)
);

CREATE TABLE department(
   department_id VARCHAR(50) ,
   department_name VARCHAR(255)  NOT NULL,
   created_at DATETIME2,
   updated_at DATETIME2,
   direction_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(department_id),
   FOREIGN KEY(direction_id) REFERENCES direction(direction_id)
);

CREATE TABLE service(
   service_id VARCHAR(50) ,
   service_name VARCHAR(255)  NOT NULL,
   created_at DATETIME2,
   updated_at DATETIME2,
   department_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(service_id),
   FOREIGN KEY(department_id) REFERENCES department(department_id)
);

CREATE TABLE site(
   site_id VARCHAR(50) ,
   site_name VARCHAR(255)  NOT NULL,
   code VARCHAR(10) ,
   longitude DECIMAL(9,6)  ,
   latitude DECIMAL(9,6)  ,
   created_at DATETIME2,
   updated_at DATETIME2,
   PRIMARY KEY(site_id)
);

CREATE TABLE nationalities(
   nationality_id VARCHAR(50) ,
   code VARCHAR(50)  NOT NULL,
   name VARCHAR(100)  NOT NULL,
   PRIMARY KEY(nationality_id),
   UNIQUE(code)
);

CREATE TABLE marital_statuses(
   marital_status_id VARCHAR(50) ,
   code VARCHAR(50)  NOT NULL,
   label VARCHAR(50)  NOT NULL,
   PRIMARY KEY(marital_status_id),
   UNIQUE(code)
);

CREATE TABLE genders(
   gender_id VARCHAR(50) ,
   code VARCHAR(50)  NOT NULL,
   label VARCHAR(50)  NOT NULL,
   PRIMARY KEY(gender_id),
   UNIQUE(code)
);

CREATE TABLE contract_types(
   contract_type_id VARCHAR(50) ,
   code VARCHAR(50)  NOT NULL,
   label VARCHAR(50)  NOT NULL,
   PRIMARY KEY(contract_type_id),
   UNIQUE(code)
);

CREATE TABLE employee_categories(
   employee_category_id VARCHAR(50) ,
   code VARCHAR(50)  NOT NULL,
   label VARCHAR(100)  NOT NULL,
   PRIMARY KEY(employee_category_id),
   UNIQUE(code)
);

CREATE TABLE working_time_types(
   working_time_type_id VARCHAR(50) ,
   code VARCHAR(50)  NOT NULL,
   label VARCHAR(50)  NOT NULL,
   PRIMARY KEY(working_time_type_id),
   UNIQUE(code)
);

CREATE TABLE units(
   unit_id VARCHAR(50) ,
   unit_name VARCHAR(100)  NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   service_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(unit_id),
   FOREIGN KEY(service_id) REFERENCES service(service_id)
);

CREATE TABLE recruitment_reasons(
   recruitment_reason_id VARCHAR(50) ,
   name VARCHAR(255)  NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY(recruitment_reason_id)
);

CREATE TABLE replacement_reasons(
   replacement_reason_id VARCHAR(50) ,
   name VARCHAR(255)  NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   PRIMARY KEY(replacement_reason_id)
);

CREATE TABLE recruitment_request_replacement_reasons(
   recruitment_reason_id VARCHAR(50) ,
   replacement_reason_id VARCHAR(50) ,
   description VARCHAR(max),
   PRIMARY KEY(recruitment_reason_id, replacement_reason_id),
   FOREIGN KEY(recruitment_reason_id) REFERENCES recruitment_reasons(recruitment_reason_id),
   FOREIGN KEY(replacement_reason_id) REFERENCES replacement_reasons(replacement_reason_id)
);

CREATE TABLE recruitment_requests (
   recruitment_request_id VARCHAR(50) PRIMARY KEY,
   position_title VARCHAR(255) NOT NULL,
   position_count INT DEFAULT 1,
   contract_duration VARCHAR(100) NULL,
   former_employee_name VARCHAR(255) NULL,
   replacement_date DATE NULL,
   new_position_explanation VARCHAR(MAX) NULL,
   desired_start_date DATE NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   status VARCHAR(10) DEFAULT 'BROUILLON',
   files VARBINARY(MAX),
   recruitment_reason_id VARCHAR(50) NOT NULL,
   site_id VARCHAR(50) NOT NULL,
   contract_type_id VARCHAR(50) NOT NULL,
   FOREIGN KEY(recruitment_reason_id) REFERENCES recruitment_reasons(recruitment_reason_id),
   FOREIGN KEY(site_id) REFERENCES site(site_id),
   FOREIGN KEY(contract_type_id) REFERENCES contract_types(contract_type_id)
);

CREATE TABLE employees (
   employee_id VARCHAR(50) PRIMARY KEY,
   employee_code VARCHAR(50) UNIQUE,
   last_name VARCHAR(50) NOT NULL,
   first_name VARCHAR(100) NOT NULL,
   birth_date DATE NULL,
   birth_place VARCHAR(100) NULL,
   children_count INT DEFAULT 0,
   cin_number VARCHAR(50) NULL,
   cin_date DATE NULL,
   cin_place VARCHAR(100) NULL,
   cnaPS_number VARCHAR(50) NULL,
   address VARCHAR(MAX) NULL,
   address_complement VARCHAR(200) NULL,
   bank_code VARCHAR(50) NULL,
   branch_code VARCHAR(50) NULL,
   account_number VARCHAR(50) NULL,
   rib_key VARCHAR(50) NULL,
   hire_date DATE NOT NULL,
   job_title VARCHAR(100) NULL,
   grade VARCHAR(50) NULL,
   is_executive BIT DEFAULT 0,
   contract_end_date DATE NULL,
   departure_date DATE NULL,
   departure_reason_code VARCHAR(50) NULL,
   departure_reason_title VARCHAR(100) NULL,
   headcount INT DEFAULT 1,
   birth_date_ DATE NULL,
   status VARCHAR(10) DEFAULT 'Actif',
   created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
   updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
   unit_id VARCHAR(50) NOT NULL,
   service_id VARCHAR(50) NOT NULL,
   department_id VARCHAR(50) NOT NULL,
   direction_id VARCHAR(50) NOT NULL,
   working_time_type_id VARCHAR(50) NOT NULL,
   employee_category_id VARCHAR(50) NOT NULL,
   contract_type_id VARCHAR(50) NOT NULL,
   gender_id VARCHAR(50) NOT NULL,
   marital_status_id VARCHAR(50) NOT NULL,
   site_id VARCHAR(50) NOT NULL,
   FOREIGN KEY (unit_id) REFERENCES units(unit_id),
   FOREIGN KEY (service_id) REFERENCES service(service_id),
   FOREIGN KEY (department_id) REFERENCES department(department_id),
   FOREIGN KEY (direction_id) REFERENCES direction(direction_id),
   FOREIGN KEY (working_time_type_id) REFERENCES working_time_types(working_time_type_id),
   FOREIGN KEY (employee_category_id) REFERENCES employee_categories(employee_category_id),
   FOREIGN KEY (contract_type_id) REFERENCES contract_types(contract_type_id),
   FOREIGN KEY (gender_id) REFERENCES genders(gender_id),
   FOREIGN KEY (marital_status_id) REFERENCES marital_statuses(marital_status_id),
   FOREIGN KEY (site_id) REFERENCES site(site_id)
);

CREATE TABLE recruitment_request_details(
   recruitment_request_detail_id VARCHAR(50) ,
   supervisor_position VARCHAR(255)  NOT NULL,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   direct_supervisor_id VARCHAR(50)  NOT NULL,
   service_id VARCHAR(50)  NOT NULL,
   department_id VARCHAR(50)  NOT NULL,
   direction_id VARCHAR(50)  NOT NULL,
   recruitment_request_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(recruitment_request_detail_id),
   FOREIGN KEY(direct_supervisor_id) REFERENCES employees(employee_id),
   FOREIGN KEY(service_id) REFERENCES service(service_id),
   FOREIGN KEY(department_id) REFERENCES department(department_id),
   FOREIGN KEY(direction_id) REFERENCES direction(direction_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id)
);

CREATE TABLE approval_flow(
   approval_flow_id VARCHAR(50) ,
   approval_order INT NOT NULL,
   approver_role VARCHAR(50) ,
   created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2,
   approver_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(approval_flow_id),
   FOREIGN KEY(approver_id) REFERENCES employees(employee_id)
);

CREATE TABLE employee_nationalities (
    employee_id VARCHAR(50),
    nationality_id VARCHAR(50),
    PRIMARY KEY(employee_id, nationality_id),
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY(nationality_id) REFERENCES nationalities(nationality_id)
);

CREATE TABLE recruitment_approval(
   recruitment_request_id VARCHAR(50) ,
   approval_flow_id VARCHAR(50) ,
   status VARCHAR(50) ,
   approval_order INT,
   approval_date DATE,
   comment VARCHAR(max),
   signature VARBINARY(max),
   created_at DATETIME2,
   updated_at DATETIME2,
   PRIMARY KEY(recruitment_request_id, approval_flow_id),
   FOREIGN KEY(recruitment_request_id) REFERENCES recruitment_requests(recruitment_request_id),
   FOREIGN KEY(approval_flow_id) REFERENCES approval_flow(approval_flow_id)
);