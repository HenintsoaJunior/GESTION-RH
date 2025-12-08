CREATE TABLE genders(
   gender_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(gender_id),
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
   first_name VARCHAR(100),
   birth_date DATE,
   birth_place VARCHAR(100),
   category VARCHAR(50),
   id_number VARCHAR(50),
   id_issue_date DATE,
   id_issue_place VARCHAR(100),
   phone_number VARCHAR(20) NULL,
   hire_date DATE,
   job_title VARCHAR(100) NULL,
   contract_end_date DATE NULL,
   status VARCHAR(50) DEFAULT 'Active',
   site_id VARCHAR(50) NOT NULL,
   gender_id VARCHAR(50) NOT NULL,
   contract_type_id VARCHAR(50) NULL,
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


CREATE TABLE user_availability (
    user_id VARCHAR(250) PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'absent')),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
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
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   transport_id VARCHAR(50),
   expense_type_id VARCHAR(50),
   PRIMARY KEY(compensation_scale_id),
   FOREIGN KEY(transport_id) REFERENCES transport(transport_id),
   FOREIGN KEY(expense_type_id) REFERENCES expense_type(expense_type_id)
);

CREATE TABLE geo_zones (
   zone_id VARCHAR(50) PRIMARY KEY,
   name VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
);

CREATE TABLE expense_compensation_scale(
   expense_compensation_scale_id VARCHAR(50),
   amount DECIMAL(15,2),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   devise VARCHAR(50) DEFAULT 'EUR',
   expense_type_id VARCHAR(50),
   zone_id VARCHAR(50) NOT NULL 
   PRIMARY KEY(expense_compensation_scale_id),
   FOREIGN KEY(expense_type_id) REFERENCES expense_type(expense_type_id),
   FOREIGN KEY(zone_id) REFERENCES geo_zones(zone_id)
);

CREATE TABLE lieu (
   lieu_id VARCHAR(50) PRIMARY KEY,
   nom VARCHAR(255) NOT NULL,
   ville VARCHAR(255),
   code_postal VARCHAR(20),
   pays VARCHAR(255) NOT NULL,
   zone_id VARCHAR(50),
   longitude DECIMAL(15,2),
   latitude DECIMAL(15,2),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   FOREIGN KEY(zone_id) REFERENCES geo_zones(zone_id)
);

CREATE TABLE mission (
   mission_id        VARCHAR(50) PRIMARY KEY,
   mission_type      VARCHAR(20)  NOT NULL DEFAULT 'unknown',
   name              VARCHAR(255),
   description       TEXT,
   start_date        DATE NOT NULL,
   end_date          DATE NOT NULL,
   status            VARCHAR(30)  NOT NULL DEFAULT 'pending approval',
   lieu_id           VARCHAR(50)  NOT NULL,
   employee_id       VARCHAR(50)  NOT NULL,                    
   departure_date    DATE,
   departure_time    TIME,
   return_date       DATE,
   return_time       TIME,
   duration          INT,                                       
   is_validated      INT          DEFAULT 0,                   
   type              VARCHAR(20)  NOT NULL DEFAULT 'Indemnité',
   allocated_fund    DECIMAL(15,2),
   transport_id      VARCHAR(50),
   created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
   updated_at        DATETIME,
   FOREIGN KEY (lieu_id)      REFERENCES lieu(lieu_id),
   FOREIGN KEY (employee_id)  REFERENCES employees(employee_id),
   FOREIGN KEY (transport_id) REFERENCES transport(transport_id)
);

CREATE TABLE prevision_price(
   prevision_id VARCHAR(50),
   amount DECIMAL(15,2),
   departure_date DATE NOT NULL,
   is_paid INT DEFAULT 0,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   mission_id VARCHAR(50) NOT NULL,
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id) ON DELETE CASCADE,
   PRIMARY KEY(prevision_id)
);


CREATE TABLE mission_validation(
   mission_validation_id VARCHAR(50)    PRIMARY KEY,
   status                VARCHAR(50),
   validation_date       DATETIME,
   type                  VARCHAR(50),
   created_at            DATETIME       DEFAULT CURRENT_TIMESTAMP,
   updated_at            DATETIME,
   to_whom               VARCHAR(250)   NOT NULL,
   mission_creator       VARCHAR(250)   NOT NULL,
   mission_id            VARCHAR(50)    NOT NULL,

   FOREIGN KEY(to_whom)         REFERENCES users(user_id)      ON DELETE NO ACTION,
   FOREIGN KEY(mission_creator) REFERENCES users(user_id)      ON DELETE NO ACTION,
   FOREIGN KEY(mission_id)      REFERENCES mission(mission_id) ON DELETE CASCADE 
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
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id) ON DELETE CASCADE,
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
   compensation_id         VARCHAR(50) PRIMARY KEY,
   transport_amount        DECIMAL(15,2),
   breakfast_amount        DECIMAL(15,2),
   lunch_amount            DECIMAL(15,2),
   dinner_amount           DECIMAL(15,2),
   accommodation_amount    DECIMAL(15,2),
   communication_amount    DECIMAL(15,2),
   visa_amount             DECIMAL(15,2),
   medical_expenses_amount DECIMAL(15,2),
   taxes_amount            DECIMAL(15,2),
   status                  VARCHAR(50) DEFAULT 'unpaid',
   payment_date            DATETIME,
   devise                  VARCHAR(50) NOT NULL,
   created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at              DATETIME,
   mission_id              VARCHAR(50) NOT NULL,
   employee_id             VARCHAR(50) NOT NULL,

   FOREIGN KEY(mission_id)  REFERENCES mission(mission_id) ON DELETE CASCADE,
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
   expense_report_id       VARCHAR(50) PRIMARY KEY,
   titled                  VARCHAR(250),
   description             TEXT,
   type                    VARCHAR(50) CHECK(type IN('CB', 'ESP')), 
   currency_unit           VARCHAR(50),
   amount                  DECIMAL(15,2),
   amount_mga              DECIMAL(15,2),
   rate                    DECIMAL(15,2),
   status                  VARCHAR(50) DEFAULT 'notreimbursed',
   created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at              DATETIME,
   mission_id              VARCHAR(50) NOT NULL,
   expense_report_type_id  VARCHAR(50) NOT NULL,

   FOREIGN KEY(mission_id)             REFERENCES mission(mission_id) ON DELETE CASCADE,
   FOREIGN KEY(expense_report_type_id) REFERENCES expense_report_type(expense_report_type_id)
);

CREATE TABLE expense_report_attachments (
   attachment_id VARCHAR(50) PRIMARY KEY,
   mission_id    VARCHAR(50) NOT NULL,
   file_name     VARCHAR(255) NOT NULL,
   file_content  VARBINARY(MAX),
   file_size     INT,
   file_type     VARCHAR(100),
   uploaded_at   DATETIME DEFAULT GETDATE(),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id) ON DELETE CASCADE
);

CREATE TABLE mission_report(
   mission_report_id VARCHAR(50) PRIMARY KEY,
   text              TEXT,
   created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at        DATETIME,
   user_id           VARCHAR(250) NOT NULL,
   mission_id        VARCHAR(50) NOT NULL,

   FOREIGN KEY(user_id)    REFERENCES users(user_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id) ON DELETE CASCADE
);

CREATE TABLE mission_report_attachments (
   attachment_id VARCHAR(50),
   mission_report_id VARCHAR(50) NOT NULL,
   file_name VARCHAR(255) NOT NULL,
   file_content VARBINARY(MAX),
   file_size INT,
   file_type VARCHAR(100),
   uploaded_at DATETIME DEFAULT GETDATE(),
   PRIMARY KEY(attachment_id),
   FOREIGN KEY(mission_report_id) REFERENCES mission_report(mission_report_id) ON DELETE CASCADE
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


CREATE TABLE tmp_employee(
   tmp_employee_id VARCHAR(250) PRIMARY KEY,
   site VARCHAR(50),
   mle VARCHAR(50),
   nom VARCHAR(100),
   prenom VARCHAR(100),
   date_naissance DATE,
   lieu_naissance VARCHAR(100),
   numero_cin VARCHAR(50),
   date_cin DATE,
   lieu_cin VARCHAR(100),
   sexe VARCHAR(50),
   nationalite VARCHAR(50),
   telephone VARCHAR(20),
   date_anciennete DATE,
   type_contrat VARCHAR(50),
   intitule_poste VARCHAR(100),
   categorie VARCHAR(50),
   unite VARCHAR(100),
   service VARCHAR(100),
   department VARCHAR(100),
   direction VARCHAR(100),
   date_fin_contrat DATE
);
